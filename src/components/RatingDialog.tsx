import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  track: any;
  album: any;
}

export default function RatingDialog({ isOpen, onClose, track, album }: RatingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [beat, setBeat] = useState(10);
  const [lyrics, setLyrics] = useState(10);
  const [flow, setFlow] = useState(10);
  const [content, setContent] = useState(10);
  const [replayValue, setReplayValue] = useState(10);
  const [notes, setNotes] = useState('');
  const [isSkitOrInterlude, setIsSkitOrInterlude] = useState(false);

  const totalScore = beat + lyrics + flow + content + replayValue;
  const averageScore = totalScore / 5;

  useEffect(() => {
    if (isOpen && track) {
      // Reset form
      setError(null);
      setSuccess(false);
      
      // Save track to database first
      saveTrackToDatabase();
      
      // Fetch existing rating if available
      fetchRating();
      
      // Check if track is a skit/interlude
      checkIfSkitOrInterlude();
    }
  }, [isOpen, track]);

  const saveTrackToDatabase = async () => {
    try {
      await fetch('/api/tracks/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          track, 
          album,
          isSkitOrInterlude
        }),
      });
    } catch (error) {
      console.error('Error saving track:', error);
    }
  };
  
  const toggleSkitOrInterlude = async (value: boolean) => {
    setIsSkitOrInterlude(value);
    try {
      await fetch('/api/tracks/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          track, 
          album,
          isSkitOrInterlude: value
        }),
      });
    } catch (error) {
      console.error('Error updating track skit/interlude status:', error);
    }
  };

  const fetchRating = async () => {
    try {
      const response = await fetch(`/api/ratings/get?trackId=${track.id}`);
      const data = await response.json();
      
      if (data) {
        setBeat(data.beat);
        setLyrics(data.lyrics);
        setFlow(data.flow);
        setContent(data.content);
        setReplayValue(data.replayValue);
        setNotes(data.notes || '');
      } else {
        // Reset to defaults if no rating exists
        setBeat(10);
        setLyrics(10);
        setFlow(10);
        setContent(10);
        setReplayValue(10);
        setNotes('');
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };
  
  const checkIfSkitOrInterlude = async () => {
    try {
      const response = await fetch(`/api/tracks/get?trackId=${track.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.isSkitOrInterlude !== undefined) {
          setIsSkitOrInterlude(data.isSkitOrInterlude);
        }
      }
    } catch (error) {
      console.error('Error checking if track is skit/interlude:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/ratings/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId: track.id,
          beat,
          lyrics,
          flow,
          content,
          replayValue,
          notes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save rating');
      }
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderSlider = (
    value: number, 
    onChange: (value: number) => void, 
    label: string
  ) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <span className="text-lg font-bold">{value}/20</span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={20}
        step={1}
        onValueChange={(values) => onChange(values[0])}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate Track: {track?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="skit-toggle" className="text-sm font-medium">
              Mark as Skit/Interlude (No Rating Required)
            </Label>
            <Switch
              id="skit-toggle"
              checked={isSkitOrInterlude}
              onCheckedChange={toggleSkitOrInterlude}
            />
          </div>
          
          {!isSkitOrInterlude && (
            <>
              {renderSlider(beat, setBeat, "Beat")}
              {renderSlider(lyrics, setLyrics, "Lyrics")}
              {renderSlider(flow, setFlow, "Flow")}
              {renderSlider(content, setContent, "Content")}
              {renderSlider(replayValue, setReplayValue, "Replay Value")}
              
              <div className="pt-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your thoughts about this track..."
                  className="mt-1"
                />
              </div>
              
              <div className="bg-muted p-4 rounded-md mt-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                  <div className="text-3xl font-bold">{averageScore.toFixed(1)}/20</div>
                  <div className="text-xs text-muted-foreground mt-1">Total: {totalScore}/100</div>
                </div>
              </div>
            </>
          )}
          
          {error && (
            <div className="text-destructive text-sm mt-2">{error}</div>
          )}
          
          {success && (
            <div className="text-green-500 text-sm mt-2">Rating saved successfully!</div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {!isSkitOrInterlude && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Rating'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}