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
    const { name, year, decade, genre, sortBy = 'rating', sortOrder = 'desc' } = req.query;

    // Get all albums that have at least one rated track
    const albums = await prisma.album.findMany({
      where: {
        tracks: {
          some: {
            rating: {
              isNot: null,
            }
          }
        },
        ...(name ? { name: { contains: name as string, mode: 'insensitive' } } : {}),
        ...(year ? { releaseDate: { contains: year as string } } : {}),
        ...(decade ? { releaseDate: { startsWith: decade as string } } : {}),
        ...(genre ? { genre: { contains: genre as string, mode: 'insensitive' } } : {}),
      },
      include: {
        tracks: {
          include: {
            rating: true
          }
        }
      }
    });

    // Calculate average rating for each album
    const ratedAlbums = albums.map(album => {
      const ratedTracks = album.tracks.filter(track => 
        track.rating && !track.isSkitOrInterlude
      );
      
      const totalRatableTracks = album.tracks.filter(track => !track.isSkitOrInterlude).length;
      
      let albumRating = null;
      if (ratedTracks.length > 0) {
        const totalPoints = ratedTracks.reduce((sum, track) => {
          if (track.rating) {
            return sum + track.rating.beat + track.rating.lyrics + 
                   track.rating.flow + track.rating.content + 
                   track.rating.replayValue;
          }
          return sum;
        }, 0);
        
        // Calculate average on a 0-10 scale
        albumRating = (totalPoints / (ratedTracks.length * 100)) * 10;
      }

      // Extract year from releaseDate
      const year = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;
      // Extract decade from year
      const decade = year ? Math.floor(year / 10) * 10 : null;

      return {
        id: album.id,
        name: album.name,
        artist: album.artist,
        releaseDate: album.releaseDate,
        imageUrl: album.imageUrl,
        year,
        decade,
        rating: albumRating !== null ? parseFloat(albumRating.toFixed(1)) : null,
        ratedTracks: ratedTracks.length,
        totalRatableTracks
      };
    });

    // Filter out albums with no ratings
    const filteredAlbums = ratedAlbums.filter(album => album.rating !== null);

    // Sort albums
    const sortedAlbums = filteredAlbums.sort((a, b) => {
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

    return res.status(200).json(sortedAlbums);
  } catch (error) {
    console.error('Error fetching rated albums:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}