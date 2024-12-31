import { copyFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DROPBOX_PATHS = {
  LYRICS: '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/SONG A DAY LYRICS CHORDS',
  VIDEO: '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Video',
  AUDIO: '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Song',
  IMAGE: '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/EverySongADayPNG',
  GIF: '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Gif'
}

export async function saveToDropbox(
  songNumber: string,
  files: {
    video?: string
    audio?: string
    image?: string
    gif?: string
    lyrics?: string
  },
  songTitle?: string  // Optional parameter for lyrics filename
) {
  try {
    if (files.video) {
      copyFileSync(files.video, join(DROPBOX_PATHS.VIDEO, `${songNumber}.mp4`))
    }
    
    if (files.audio) {
      copyFileSync(files.audio, join(DROPBOX_PATHS.AUDIO, `${songNumber}.wav`))
    }
    
    if (files.image) {
      copyFileSync(files.image, join(DROPBOX_PATHS.IMAGE, `${songNumber}.jpg`))
    }

    if (files.gif) {
      copyFileSync(files.gif, join(DROPBOX_PATHS.GIF, `${songNumber}.gif`))
    }
    
    if (files.lyrics && songTitle) {
      const safeTitle = songTitle.replace(/[/\\?%*:|"<>]/g, '-')
      writeFileSync(
        join(DROPBOX_PATHS.LYRICS, `${safeTitle}.txt`),
        files.lyrics
      )
    }

    return true
  } catch (error) {
    console.error('Error saving files to Dropbox:', error)
    throw error
  }
} 