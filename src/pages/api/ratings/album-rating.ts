import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { albumId } = req.query;

    if (!albumId) {
      return res.status(400).json({ message: 'Album ID is required' });
    }

    // Get all tracks for the album that are not skits/interludes
    const tracks = await prisma.track.findMany({
      where: { 
        albumId: albumId as string,
        isSkitOrInterlude: false
      },
      include: {
        rating: true
      }
    });

    // Filter tracks that have ratings
    const tracksWithRatings = tracks.filter(track => track.rating !== null);
    
    if (tracksWithRatings.length === 0) {
      return res.status(200).json({ 
        albumRating: null,
        message: 'No rated tracks found for this album'
      });
    }

    // Calculate the average rating for each track
    const trackRatings = tracksWithRatings.map(track => {
      const rating = track.rating!;
      return (rating.beat + rating.lyrics + rating.flow + rating.content + rating.replayValue) / 5;
    });

    // Calculate the overall album rating
    const totalRating = trackRatings.reduce((sum, rating) => sum + rating, 0);
    const averageRating = totalRating / tracksWithRatings.length;
    
    // Convert to a 0-10 scale (divide by 2)
    const albumRating = averageRating / 2;

    return res.status(200).json({
      albumRating: albumRating.toFixed(1),
      ratedTracks: tracksWithRatings.length,
      totalTracks: tracks.length,
      trackRatings: tracksWithRatings.map(track => ({
        id: track.id,
        name: track.name,
        trackNumber: track.trackNumber,
        averageRating: ((track.rating!.beat + track.rating!.lyrics + track.rating!.flow + 
                        track.rating!.content + track.rating!.replayValue) / 5).toFixed(1)
      }))
    });
  } catch (error) {
    console.error('Error calculating album rating:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}