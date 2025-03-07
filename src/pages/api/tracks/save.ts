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
    const { track, album, isSkitOrInterlude } = req.body;

    if (!track || !album) {
      return res.status(400).json({ message: 'Track and album data are required' });
    }

    // Check if album exists, if not create it
    let albumRecord = await prisma.album.findUnique({
      where: { id: album.id }
    });

    if (!albumRecord) {
      albumRecord = await prisma.album.create({
        data: {
          id: album.id,
          name: album.name,
          artist: album.artists.map((a: any) => a.name).join(', '),
          releaseDate: album.release_date || null,
          imageUrl: album.images?.[0]?.url || null,
        }
      });
    }

    // Check if track exists, if not create it
    let trackRecord = await prisma.track.findUnique({
      where: { id: track.id }
    });

    if (!trackRecord) {
      trackRecord = await prisma.track.create({
        data: {
          id: track.id,
          name: track.name,
          albumId: album.id,
          trackNumber: track.track_number,
          durationMs: track.duration_ms,
          isSkitOrInterlude: isSkitOrInterlude || false,
        }
      });
    } else if (isSkitOrInterlude !== undefined) {
      // Update the isSkitOrInterlude flag if it's provided
      trackRecord = await prisma.track.update({
        where: { id: track.id },
        data: { isSkitOrInterlude }
      });
    }

    return res.status(200).json({ 
      success: true, 
      track: trackRecord 
    });
  } catch (error) {
    console.error('Error saving track:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}