import { join } from 'path'

// Project root path
export const projectPath = process.cwd()

// API Keys and Secrets
export const API_KEYS = {
  YOUTUBE: 'AIzaSyBHzwE9Jz86Y4DM6sSRO9XOGinQabnp7NY',
  SHEETS: 'AIzaSyBKBiMZRSP0oLCde6sEgQG8wlE5C0yWr6U',
  ASSEMBLY: 'e30dbf3898b245439834a51479f53138',
  PINATA: {
    KEY: 'f974f215a326c7d2229d',
    SECRET: 'f7b554d8a49a650bd3c679ddf5f7c64008706ed3c913bc2fa5ee16caa8a26b0c'
  }
}

// Dropbox paths
export const PATHS = {
  LYRICS: '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/SONG A DAY LYRICS CHORDS',
  VIDEO: '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Video',
  AUDIO: '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Song',
  IMAGE: '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/EverySongADayPNG',
  METADATA: '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Metadata unclean',
  OUTPUT: '/Users/jonathanmann/songaday-toolkit copy/output',
  
  // Auth paths
  YOUTUBE_CLIENT_SECRET: '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/python_scripts/home for wayward files needed in scripts/client_secret_298332297239-26f4ipajoihjjjtqadu0bnt24kaaqfah.apps.googleusercontent.com.json',
  SHEETS_CLIENT_SECRET: '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/python_scripts/home for wayward files needed in scripts/client_secret_717772408281-lt7t2iajs42un4drqv5eqqnrr6lqh0b3.apps.googleusercontent.com.json'
}

// Helper function to get output path for a song number
export const getOutputPath = (songNbr: string | number) => {
  return join(projectPath, 'output', String(songNbr))
} 