import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RatedAlbum {
  id: string;
  name: string;
  artist: string;
  releaseDate: string | null;
  imageUrl: string | null;
  year: number | null;
  decade: number | null;
  rating: number | null;
  ratedTracks: number;
  totalRatableTracks: number;
}

export default function RatedAlbums() {
  const router = useRouter();
  const [albums, setAlbums] = useState<RatedAlbum[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<RatedAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [decadeFilter, setDecadeFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Unique decades and years for filtering
  const [availableDecades, setAvailableDecades] = useState<number[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    fetchRatedAlbums();
  }, []);

  useEffect(() => {
    if (albums.length > 0) {
      // Extract unique decades and years for filters
      const decadesSet = new Set<number>();
      const yearsSet = new Set<number>();
      
      albums.forEach(album => {
        if (album.decade !== null) decadesSet.add(album.decade);
        if (album.year !== null) yearsSet.add(album.year);
      });
      
      const decades = Array.from(decadesSet).sort() as number[];
      const years = Array.from(yearsSet).sort() as number[];
      
      setAvailableDecades(decades);
      setAvailableYears(years);
      
      // Apply filters
      applyFilters();
    }
  }, [albums, nameFilter, yearFilter, decadeFilter, sortBy, sortOrder]);

  const fetchRatedAlbums = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/albums/rated');
      if (!response.ok) {
        throw new Error('Failed to fetch rated albums');
      }
      const data = await response.json();
      setAlbums(data);
      setFilteredAlbums(data);
    } catch (error) {
      console.error('Error fetching rated albums:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...albums];
    
    // Apply name filter
    if (nameFilter) {
      filtered = filtered.filter(album => 
        album.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
        album.artist.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    
    // Apply year filter
    if (yearFilter) {
      filtered = filtered.filter(album => 
        album.year === parseInt(yearFilter)
      );
    }
    
    // Apply decade filter
    if (decadeFilter) {
      filtered = filtered.filter(album => 
        album.decade === parseInt(decadeFilter)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return sortOrder === 'desc' 
          ? (b.rating || 0) - (a.rating || 0) 
          : (a.rating || 0) - (b.rating || 0);
      } else if (sortBy === 'name') {
        return sortOrder === 'desc' 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name);
      } else if (sortBy === 'artist') {
        return sortOrder === 'desc' 
          ? b.artist.localeCompare(a.artist) 
          : a.artist.localeCompare(b.artist);
      } else if (sortBy === 'year') {
        return sortOrder === 'desc' 
          ? (b.year || 0) - (a.year || 0) 
          : (a.year || 0) - (b.year || 0);
      }
      return 0;
    });
    
    setFilteredAlbums(filtered);
  };

  const resetFilters = () => {
    setNameFilter('');
    setYearFilter('');
    setDecadeFilter('');
    setSortBy('rating');
    setSortOrder('desc');
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-');
    setSortBy(field);
    setSortOrder(order);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="h-16 w-auto">
          <img 
            src="https://assets.co.dev/cb4131ac-f7a4-419e-994c-6a6f2f907c69/soundrank-2f76de4.png"
            alt="SOUNDRANK"
            className="h-full w-auto"
          />
        </div>
        <Link href="/">
          <Button variant="outline">Back to Search</Button>
        </Link>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Filter by album or artist name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy + '-' + sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating-desc">Highest Rating</SelectItem>
                <SelectItem value="rating-asc">Lowest Rating</SelectItem>
                <SelectItem value="name-asc">Album Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Album Name (Z-A)</SelectItem>
                <SelectItem value="artist-asc">Artist Name (A-Z)</SelectItem>
                <SelectItem value="artist-desc">Artist Name (Z-A)</SelectItem>
                <SelectItem value="year-desc">Newest First</SelectItem>
                <SelectItem value="year-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {availableDecades.map(decade => (
              <TabsTrigger 
                key={decade} 
                value={decade.toString()}
                onClick={() => setDecadeFilter(decade.toString())}
              >
                {decade}s
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {decadeFilter && (
              <div className="mb-4 flex flex-wrap gap-2">
                {availableYears
                  .filter(year => Math.floor(year / 10) * 10 === parseInt(decadeFilter))
                  .map(year => (
                    <Badge 
                      key={year}
                      variant={yearFilter === year.toString() ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setYearFilter(yearFilter === year.toString() ? '' : year.toString())}
                    >
                      {year}
                    </Badge>
                  ))
                }
              </div>
            )}
          </TabsContent>
          
          {availableDecades.map(decade => (
            <TabsContent key={decade} value={decade.toString()} className="mt-0">
              <div className="mb-4 flex flex-wrap gap-2">
                {availableYears
                  .filter(year => Math.floor(year / 10) * 10 === decade)
                  .map(year => (
                    <Badge 
                      key={year}
                      variant={yearFilter === year.toString() ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setYearFilter(yearFilter === year.toString() ? '' : year.toString())}
                    >
                      {year}
                    </Badge>
                  ))
                }
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAlbums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => (
            <Card
              key={album.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => router.push(`/?albumId=${album.id}`)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {album.imageUrl ? (
                  <img
                    src={album.imageUrl}
                    alt={album.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {album.name}
                    {album.year && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({album.year})
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{album.artist}</p>
                  <p className="text-xs text-muted-foreground">
                    {album.ratedTracks} of {album.totalRatableTracks} tracks rated
                  </p>
                </div>
                {album.rating !== null && (
                  <Badge className="text-lg px-3 py-1 bg-primary">
                    {album.rating.toFixed(1)}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No rated albums found</p>
          {(nameFilter || yearFilter || decadeFilter) && (
            <Button variant="outline" onClick={resetFilters} className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}