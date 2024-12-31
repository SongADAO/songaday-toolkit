import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

const LOCAL_OUTPUT = '/Users/jonathanmann/songaday-toolkit copy/output'
const UNCLEAN_METADATA_PATH = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Metadata unclean'

interface InitialMetadata {
  songNbr: string
  title: string
  date: string
  description?: string
  location?: string
  topic?: string
  instrument?: string
  otherInstruments?: string
  mood?: string
  genre?: string
  style?: string
  otherStyles?: string
  noun?: string
  properNoun?: string
  lyrics?: string
}

export function saveInitialMetadata(metadata: InitialMetadata) {
  const outputDir = join(LOCAL_OUTPUT, metadata.songNbr)
  
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const metadataPath = join(outputDir, 'initial-metadata.json')
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
  
  return metadataPath
}

export function updateInitialMetadata(songNbr: string, updates: Partial<InitialMetadata>) {
  const outputDir = join(LOCAL_OUTPUT, songNbr)
  const metadataPath = join(outputDir, 'initial-metadata.json')
  
  const existingMetadata = JSON.parse(readFileSync(metadataPath, 'utf8'))
  const updatedMetadata = { ...existingMetadata, ...updates }
  
  writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, 2))
  return metadataPath
}

export function saveFinalMetadata(songNbr: string, metadata: any) {
  if (!existsSync(UNCLEAN_METADATA_PATH)) {
    mkdirSync(UNCLEAN_METADATA_PATH, { recursive: true })
  }

  const metadataPath = join(UNCLEAN_METADATA_PATH, `${songNbr}.json`)
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
  
  return metadataPath
} 