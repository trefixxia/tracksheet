import { useState } from 'react';
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
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const searchAlbums = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/spotify/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setAlbums(data);
    } catch (error) {
      console.error('Error searching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (album: Album) => {
    const headers = ['Track Number', 'Track Name', 'Duration'];
    const rows = album.tracks.map(track => [
      track.track_number,
      track.name,
      new Date(track.duration_ms).toISOString().substr(14, 5)
    ]);

    const csvContent = [
      `Album: ${album.name}`,
      `Artist: ${album.artists.map(a => a.name).join(', ')}`,
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
          ) : (
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
                    <h3 className="font-semibold">{album.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {album.artists.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {selectedAlbum && (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{selectedAlbum.name}</span>
                <Button onClick={() => exportToCSV(selectedAlbum)}>
                  Export to CSV
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Track No.</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[100px]">Duration</TableHead>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}