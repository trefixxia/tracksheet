import { NextApiRequest, NextApiResponse } from 'next';

async function getSpotifyToken() {
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

  const data = await response.json();
  return data.access_token;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query } = req.query;
    const token = await getSpotifyToken();

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

    const searchData = await searchResponse.json();
    
    // Get tracks for each album
    const albums = await Promise.all(
      searchData.albums.items.map(async (album: any) => {
        const tracksResponse = await fetch(
          `https://api.spotify.com/v1/albums/${album.id}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const tracksData = await tracksResponse.json();
        return {
          ...album,
          tracks: tracksData.items,
        };
      })
    );

    res.status(200).json(albums);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}