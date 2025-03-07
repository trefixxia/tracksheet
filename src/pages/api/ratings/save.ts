import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { trackId, beat, lyrics, flow, content, replayValue, notes } = req.body;

    if (!trackId) {
      return res.status(400).json({ message: 'Track ID is required' });
    }

    // Validate ratings are between 0 and 20
    const ratings = [beat, lyrics, flow, content, replayValue];
    for (const rating of ratings) {
      if (rating < 0 || rating > 20) {
        return res.status(400).json({ message: 'Ratings must be between 0 and 20' });
      }
    }

    // Check if track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId }
    });

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Upsert rating (create if doesn't exist, update if it does)
    const rating = await prisma.rating.upsert({
      where: { trackId },
      update: {
        beat,
        lyrics,
        flow,
        content,
        replayValue,
        notes: notes || null
      },
      create: {
        trackId,
        beat,
        lyrics,
        flow,
        content,
        replayValue,
        notes: notes || null
      }
    });

    return res.status(200).json({ 
      success: true, 
      rating 
    });
  } catch (error) {
    console.error('Error saving rating:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}