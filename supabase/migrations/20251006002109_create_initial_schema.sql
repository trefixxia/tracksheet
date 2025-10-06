/*
  # Create Initial Schema

  1. New Tables
    - `Album`
      - `id` (text, primary key)
      - `name` (text)
      - `artist` (text)
      - `releaseDate` (text, optional)
      - `imageUrl` (text, optional)
      - `genre` (text, optional)
      - `createdAt` (timestamptz, default now)
    
    - `Track`
      - `id` (text, primary key)
      - `name` (text)
      - `albumId` (text, foreign key to Album)
      - `trackNumber` (integer)
      - `durationMs` (integer)
      - `isSkitOrInterlude` (boolean, default false)
      - `createdAt` (timestamptz, default now)
    
    - `Rating`
      - `id` (text, primary key, cuid)
      - `trackId` (text, unique, foreign key to Track)
      - `beat` (integer, 0-20)
      - `lyrics` (integer, 0-20)
      - `flow` (integer, 0-20)
      - `content` (integer, 0-20)
      - `replayValue` (integer, 0-20)
      - `notes` (text, optional)
      - `createdAt` (timestamptz, default now)
      - `updatedAt` (timestamptz, updated on change)

  2. Security
    - Enable RLS on all tables
    - Add public access policies (no auth required for this app)
*/

-- Create Album table
CREATE TABLE IF NOT EXISTS "Album" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  "releaseDate" TEXT,
  "imageUrl" TEXT,
  genre TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create Track table
CREATE TABLE IF NOT EXISTS "Track" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "albumId" TEXT NOT NULL,
  "trackNumber" INTEGER NOT NULL,
  "durationMs" INTEGER NOT NULL,
  "isSkitOrInterlude" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT "Track_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"(id) ON DELETE CASCADE
);

-- Create Rating table
CREATE TABLE IF NOT EXISTS "Rating" (
  id TEXT PRIMARY KEY,
  "trackId" TEXT UNIQUE NOT NULL,
  beat INTEGER NOT NULL,
  lyrics INTEGER NOT NULL,
  flow INTEGER NOT NULL,
  content INTEGER NOT NULL,
  "replayValue" INTEGER NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT "Rating_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"(id) ON DELETE CASCADE
);

-- Enable RLS on all tables
ALTER TABLE "Album" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Track" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Rating" ENABLE ROW LEVEL SECURITY;

-- Create public access policies (no authentication required)
CREATE POLICY "Allow public read access on Album"
  ON "Album" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access on Album"
  ON "Album" FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access on Album"
  ON "Album" FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access on Album"
  ON "Album" FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access on Track"
  ON "Track" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access on Track"
  ON "Track" FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access on Track"
  ON "Track" FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access on Track"
  ON "Track" FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access on Rating"
  ON "Rating" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access on Rating"
  ON "Rating" FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access on Rating"
  ON "Rating" FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access on Rating"
  ON "Rating" FOR DELETE
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "Track_albumId_idx" ON "Track"("albumId");
CREATE INDEX IF NOT EXISTS "Rating_trackId_idx" ON "Rating"("trackId");