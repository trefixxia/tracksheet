import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TrackRatingProps {
  trackId: string;
}

export default function TrackRating({ trackId }: TrackRatingProps) {
  const [rating, setRating] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSkitOrInterlude, setIsSkitOrInterlude] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if track is a skit/interlude
        const trackResponse = await fetch(`/api/tracks/get?trackId=${trackId}`);
        if (trackResponse.ok) {
          const trackData = await trackResponse.json();
          if (trackData && trackData.isSkitOrInterlude !== undefined) {
            setIsSkitOrInterlude(trackData.isSkitOrInterlude);
          }
        }
        
        // Fetch rating if not a skit/interlude
        if (!isSkitOrInterlude) {
          const ratingResponse = await fetch(`/api/ratings/get?trackId=${trackId}`);
          const ratingData = await ratingResponse.json();
          setRating(ratingData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trackId, isSkitOrInterlude]);

  if (loading) {
    return <span className="w-12 h-6 bg-muted animate-pulse rounded-full"></span>;
  }
  
  if (isSkitOrInterlude) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-500">
        Skit/Interlude
      </Badge>
    );
  }

  if (!rating) {
    return null;
  }

  const averageScore = (
    (rating.beat + rating.lyrics + rating.flow + rating.content + rating.replayValue) / 5
  ).toFixed(1);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getVariantByScore(parseFloat(averageScore))}>
            {averageScore}/20
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 p-1">
            <div className="text-xs">Beat: {rating.beat}/20</div>
            <div className="text-xs">Lyrics: {rating.lyrics}/20</div>
            <div className="text-xs">Flow: {rating.flow}/20</div>
            <div className="text-xs">Content: {rating.content}/20</div>
            <div className="text-xs">Replay Value: {rating.replayValue}/20</div>
            {rating.notes && (
              <div className="text-xs mt-2 max-w-[200px] border-t pt-1">
                {rating.notes}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getVariantByScore(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 15) return "default"; // Good rating
  if (score >= 10) return "secondary"; // Average rating
  if (score >= 5) return "outline"; // Below average
  return "destructive"; // Poor rating
}