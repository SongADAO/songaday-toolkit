import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const LYRICS_PATH = '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/SONG A DAY LYRICS CHORDS'

export function saveLyrics(songNumber: string, lyrics: string) {
  if (!existsSync(LYRICS_PATH)) {
    mkdirSync(LYRICS_PATH, { recursive: true })
  }

  const filePath = join(LYRICS_PATH, `${songNumber}.txt`)
  writeFileSync(filePath, lyrics)
  return filePath
} 