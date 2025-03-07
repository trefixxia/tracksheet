import { NextApiRequest, NextApiResponse } from 'next';

async function getSpotifyToken() {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error('No access token received');
    }
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query, albumId } = req.query;
    
    if (!query && !albumId) {
      return res.status(400).json({ message: 'Either query or albumId parameter is required' });
    }

    const token = await getSpotifyToken();
    
    let albumsToProcess: any[] = [];

    if (albumId) {
      // Fetch a specific album by ID
      const albumResponse = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!albumResponse.ok) {
        throw new Error(`Album request failed: ${albumResponse.statusText}`);
      }

      const albumData = await albumResponse.json();
      albumsToProcess = [albumData];
    } else {
      // Search for albums by query
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query as string
        )}&type=album&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!searchResponse.ok) {
        throw new Error(`Search request failed: ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.albums?.items) {
        return res.status(200).json([]);
      }
      
      albumsToProcess = searchData.albums.items;
    }

    // Get tracks for each album
    const albums = await Promise.all(
      albumsToProcess.map(async (album: any) => {
        try {
          let allTracks: any[] = [];
          let nextUrl = `https://api.spotify.com/v1/albums/${album.id}/tracks?limit=50`;

          while (nextUrl) {
            const tracksResponse = await fetch(nextUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!tracksResponse.ok) {
              console.error(`Failed to fetch tracks for album ${album.id}`);
              break;
            }

            const tracksData = await tracksResponse.json();
            allTracks = [...allTracks, ...tracksData.items];
            nextUrl = tracksData.next;
          }

          return {
            ...album,
            tracks: allTracks,
          };
        } catch (error) {
          console.error(`Error fetching tracks for album ${album.id}:`, error);
          return {
            ...album,
            tracks: [],
          };
        }
      })
    );

    res.status(200).json(albums);
  } catch (error) {
    console.error('Error in API handler:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}