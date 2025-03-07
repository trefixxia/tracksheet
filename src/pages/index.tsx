import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import RatingDialog from '@/components/RatingDialog';
import TrackRating from '@/components/TrackRating';

interface Track {
  id: string;
  name: string;
  duration_ms: number;
  track_number: number;
}

interface Album {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  images: Array<{ url: string }>;
  tracks: Track[];
  release_date?: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [albumRating, setAlbumRating] = useState<string | null>(null);
  const [ratedTracks, setRatedTracks] = useState<number>(0);
  const [totalRatableTracks, setTotalRatableTracks] = useState<number>(0);
  const [loadingAlbumFromId, setLoadingAlbumFromId] = useState(false);
  
  // Check for albumId in URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const albumId = urlParams.get('albumId');
    
    if (albumId) {
      loadAlbumById(albumId);
    }
  }, []);
  
  useEffect(() => {
    if (selectedAlbum) {
      fetchAlbumRating(selectedAlbum.id);
    } else {
      setAlbumRating(null);
      setRatedTracks(0);
      setTotalRatableTracks(0);
    }
  }, [selectedAlbum, ratingDialogOpen]);
  
  const loadAlbumById = async (albumId: string) => {
    setLoadingAlbumFromId(true);
    setError(null);
    try {
      const response = await fetch(`/api/spotify/search?albumId=${encodeURIComponent(albumId)}`);
      if (!response.ok) {
        throw new Error('Failed to load album. Please try again.');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setSelectedAlbum(data[0]);
      } else {
        throw new Error('Album not found');
      }
    } catch (error) {
      console.error('Error loading album:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoadingAlbumFromId(false);
    }
  };
  
  const fetchAlbumRating = async (albumId: string) => {
    try {
      const response = await fetch(`/api/ratings/album-rating?albumId=${albumId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.albumRating) {
          setAlbumRating(data.albumRating);
          setRatedTracks(data.ratedTracks);
          setTotalRatableTracks(data.totalTracks);
        } else {
          setAlbumRating(null);
          setRatedTracks(0);
          setTotalRatableTracks(data.totalTracks || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching album rating:', error);
      setAlbumRating(null);
    }
  };

  const searchAlbums = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/spotify/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search albums. Please try again.');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setAlbums(data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error searching albums:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (album: Album) => {
    try {
      const headers = ['Track Number', 'Track Name', 'Duration'];
      const rows = album.tracks.map(track => [
        track.track_number,
        track.name,
        new Date(track.duration_ms).toISOString().substr(14, 5)
      ]);

      const csvContent = [
        `Album: ${album.name}`,
        `Artist: ${album.artists.map(a => a.name).join(', ')}`,
        `Released: ${album.release_date ? new Date(album.release_date).toLocaleDateString() : 'Release date unknown'}`,
        '',
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${album.name} - Tracklist.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Failed to export CSV file');
    }
  };

  const exportToHTML = async (album: Album) => {
    try {
      const response = await fetch('/api/spotify/export-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tracks: album.tracks,
          albumName: album.name,
          artistName: album.artists.map(a => a.name).join(', '),
          releaseDate: album.release_date
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate HTML export');
      }

      const htmlContent = await response.text();
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      } else {
        setError('Please allow pop-ups to view the HTML export');
      }
    } catch (error) {
      console.error('Error exporting HTML:', error);
      setError('Failed to export HTML file');
    }
  };

  const exportToText = (album: Album) => {
    try {
      const textContent = [
        `Album: ${album.name}`,
        `Artist: ${album.artists.map(a => a.name).join(', ')}`,
        `Released: ${album.release_date ? new Date(album.release_date).toLocaleDateString() : 'Release date unknown'}`,
        '',
        'Tracklist:',
        ...album.tracks.map(track => 
          `${track.track_number}. ${track.name} (${new Date(track.duration_ms).toISOString().substr(14, 5)})`
        )
      ].join('\n');

      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${album.name} - Tracklist.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting text:', error);
      setError('Failed to export text file');
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">Music Tracklist Explorer</h1>
      
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Search for an album..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchAlbums()}
          className="max-w-xl"
        />
        <Button onClick={searchAlbums} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))
          ) : albums.length > 0 ? (
            albums.map((album) => (
              <Card
                key={album.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setSelectedAlbum(album)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  {album.images[0] && (
                    <img
                      src={album.images[0].url}
                      alt={album.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {album.name}
                      {album.release_date && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          ({new Date(album.release_date).getFullYear()})
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {album.artists.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : searchQuery && !loading && (
            <Card>
              <CardContent className="p-4">
                <p className="text-muted-foreground">No albums found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {selectedAlbum && (
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="block">{selectedAlbum.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Released: {selectedAlbum.release_date ? new Date(selectedAlbum.release_date).toLocaleDateString() : 'Release date unknown'}
                    </span>
                  </div>
                  {albumRating ? (
                    <div className="flex flex-col items-end">
                      <Badge className="text-lg px-3 py-1 bg-primary">
                        {albumRating}/10
                      </Badge>
                      <span className="text-xs text-muted-foreground mt-1">
                        {ratedTracks} of {totalRatableTracks} tracks rated
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No tracks rated yet
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={() => exportToText(selectedAlbum)}>
                    Export as Text
                  </Button>
                  <Button variant="outline" onClick={() => exportToHTML(selectedAlbum)}>
                    Export as HTML
                  </Button>
                  <Button onClick={() => exportToCSV(selectedAlbum)}>
                    Export as CSV
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Track No.</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[100px]">Duration</TableHead>
                    <TableHead className="w-[100px]">Rating</TableHead>
                    <TableHead className="w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedAlbum.tracks.map((track) => (
                    <TableRow key={track.id}>
                      <TableCell>{track.track_number}</TableCell>
                      <TableCell>{track.name}</TableCell>
                      <TableCell>
                        {new Date(track.duration_ms).toISOString().substr(14, 5)}
                      </TableCell>
                      <TableCell>
                        <TrackRating trackId={track.id} />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrack(track);
                            setRatingDialogOpen(true);
                          }}
                        >
                          Rate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedTrack && selectedAlbum && (
        <RatingDialog
          isOpen={ratingDialogOpen}
          onClose={() => setRatingDialogOpen(false)}
          track={selectedTrack}
          album={selectedAlbum}
        />
      )}
    </div>
  );
}