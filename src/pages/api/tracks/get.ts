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
    const { trackId } = req.query;

    if (!trackId) {
      return res.status(400).json({ message: 'Track ID is required' });
    }

    const track = await prisma.track.findUnique({
      where: { id: trackId as string }
    });

    return res.status(200).json(track || null);
  } catch (error) {
    console.error('Error getting track:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}