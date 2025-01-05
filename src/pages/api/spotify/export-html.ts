import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tracks, albumName, artistName, releaseDate } = req.body;

    if (!tracks || !Array.isArray(tracks)) {
      return res.status(400).json({ error: 'Invalid tracks data' });
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${albumName} - Track List</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 0 1rem;
            line-height: 1.5;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 0.5rem;
        }
        h2 {
            color: #666;
            font-size: 1.2rem;
            margin-bottom: 1.5rem;
        }
        ol {
            padding-left: 1.5rem;
        }
        li {
            margin-bottom: 0.5rem;
            color: #444;
        }
        footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <h1>${albumName}</h1>
    <h2>by ${artistName}</h2>
    <ol>
        ${tracks.map((track: any) => `<li>${track.name}</li>`).join('\n        ')}
    </ol>
    <footer>
        Generated on ${new Date().toLocaleDateString()}
    </footer>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(htmlContent);
  } catch (error) {
    console.error('Error generating HTML:', error);
    res.status(500).json({ error: 'Failed to generate HTML export' });
  }
}