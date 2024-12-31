import { NextApiRequest, NextApiResponse } from 'next'
import { withSession } from '@/lib/session'
import { processVideo } from '@/lib/video'
import { transcribeAudio } from '@/lib/assembly'
import { updateSongSheet } from '@/lib/sheet-utils'
import { join } from 'path'
import { existsSync } from 'fs'
import formidable from 'formidable'
import { saveToDropbox } from '@/lib/file-utils'
import { saveInitialMetadata, updateInitialMetadata, saveFinalMetadata } from '@/lib/metadata'
import { uploadToYoutube } from '@/lib/youtube'
import ffmpeg from 'fluent-ffmpeg'
import { uploadToIPFSAndFormatMetadata } from '@/lib/ipfs-utils'
import { postTweetThread } from '@/lib/twitter'
import fs from 'fs'

type FormidableParseResult = {
  files: {
    [key: string]: formidable.File;
  };
  fields: {
    [key: string]: string;
  };
};

interface SongSheetUpdate {
  songNumber: string;
  date: string;
  lyrics?: string;
  youtubeUrl?: string;
  title?: string;
  localVideoPath?: string;
  localImagePath?: string;
  metadata?: any; // Replace 'any' with proper metadata type if available
}

interface InitialMetadata {
  youtubeUrl?: string;
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const LYRICS_PATH = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/SONG A DAY LYRICS CHORDS'

// First get the duration
const getDuration = async (videoPath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata.format.duration || 0);
    });
  });
};

export default withSession(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('1. Starting video processing...')
    
    console.log('2. Setting up form parser...')
    const { files, fields } = await new Promise<FormidableParseResult>(function (resolve, reject) {
      const form = new formidable.IncomingForm({
        keepExtensions: true,
        maxFileSize: 1024 * 1024 * 1024 * 30,
      })
      form.parse(req, function (err, fields, files) {
        if (err) {
          console.error('Form parsing error:', err)
          return reject(err)
        }
        console.log('Form parsed successfully')
        resolve({ files, fields })
      })
    })

    if (!files || !files.file) {
      console.error('No file found in request')
      return res.status(400).json({ error: 'Missing video file' })
    }

    console.log('3. Parsing metadata...')
    const videoFile = files.file
    const metadata = JSON.parse(fields.data as string)

    // Save initial metadata
    const metadataPath = saveInitialMetadata(metadata)
    console.log('Initial metadata saved to:', metadataPath)

    console.log('Metadata parsed:', {
      songNumber: metadata.songNbr,
      title: metadata.title,
      tempPath: videoFile.filepath
    })

    // Check if lyrics already exist
    const lyricsPath = join(LYRICS_PATH, `${metadata.songNbr}.txt`)
    const hasExistingLyrics = existsSync(lyricsPath)
    
    console.log('Lyrics status:', hasExistingLyrics ? 'Found existing lyrics' : 'No lyrics found')

    // Split video into audio and screenshot first
    console.log('4. Starting video processing with ffmpeg...')
    console.log('Input video path:', videoFile.filepath)
    const { audioPath, imagePath, gifPath } = await processVideo(
      videoFile.filepath,
      metadata.songNbr
    )
    console.log('5. Video processing complete:', { audioPath, imagePath, gifPath })

    let lyrics = null
    if (!hasExistingLyrics) {
      console.log('6. Starting audio transcription...')
      const isInstrumental = metadata.topics && metadata.topics.includes("instrumental")
      lyrics = await transcribeAudio(audioPath, isInstrumental)
      console.log('7. Transcription complete. Length:', lyrics?.length || 0, 'characters')
      
      // Update initial metadata with lyrics
      if (lyrics) {
        await updateInitialMetadata(metadata.songNbr, { lyrics })
      }
    } else {
      // If lyrics exist, read them from the file
      lyrics = fs.readFileSync(lyricsPath, 'utf8')
      console.log('6. Using existing lyrics from file')
    }

    // Save files to Dropbox
    await saveToDropbox(
      metadata.songNbr,
      {
        video: videoFile.filepath,
        audio: audioPath,
        image: imagePath,
        gif: gifPath,
        lyrics: lyrics || undefined
      },
      metadata.title
    )

    // Update spreadsheet
    console.log('8. Updating spreadsheet...')
    await updateSongSheet({
      songNumber: metadata.songNbr,
      title: metadata.title,
      date: metadata.date,
      lyrics,
      localVideoPath: videoFile.filepath,
      localImagePath: imagePath,
      metadata
    })
    console.log('9. Spreadsheet updated successfully')

    console.log('Uploading to YouTube...')
    const tags = [
      metadata.location,
      metadata.instrument,
      metadata.otherInstruments,
      metadata.mood,
      metadata.style,
      metadata.otherStyles,
      metadata.noun,
      metadata.properNoun,
      `Song A Day ${metadata.year + 2008}`
    ].filter(Boolean)
      .flatMap(tag => tag.split(','))
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const youtubeResult = await uploadToYoutube({
      videoPath: videoFile.filepath,
      title: metadata.title,
      songNumber: metadata.songNbr,
      description: metadata.description || '',
      lyrics: lyrics || undefined,
      tags: tags
    })

    console.log('YouTube upload complete:', youtubeResult.url)

    // Add this new section to update spreadsheet with YouTube URL
    console.log('Adding YouTube URL and lyrics to spreadsheet...')
    await updateSongSheet({
      songNumber: metadata.songNbr,
      date: metadata.date,
      lyrics: lyrics,           // This will go to column U
      youtubeUrl: youtubeResult.url  // This will go to column T
    })
    console.log('YouTube URL and lyrics added to spreadsheet successfully')

    // Update initial metadata with YouTube URL
    await updateInitialMetadata(metadata.songNbr, { 
      youtubeUrl: youtubeResult.url 
    })

    console.log('Uploading to IPFS and formatting metadata...')
    const ipfsResult = await uploadToIPFSAndFormatMetadata(
      {
        ...metadata,
        youtubeUrl: youtubeResult.url
      },
      videoFile.filepath,
      audioPath,
      imagePath,
      gifPath,
      lyrics
    )
    console.log('IPFS upload complete:', ipfsResult)

    console.log('Posting to Twitter...')
    const twitterResult = await postTweetThread({
      videoPath: videoFile.filepath,
      description: metadata.description || '',
      songNumber: metadata.songNbr,
      imagePath: imagePath
    })
    console.log('Twitter thread posted:', twitterResult.firstTweetUrl)

    // Save final metadata to unclean directory
    console.log('Saving final metadata to unclean directory...')
    const finalMetadata = {
      ...metadata,
      youtubeUrl: youtubeResult.url,
      lyrics,
      ipfsHashes: ipfsResult,
      twitterUrl: twitterResult.firstTweetUrl
    }
    const uncleanMetadataPath = await saveFinalMetadata(metadata.songNbr, finalMetadata)
    console.log('Final metadata saved to:', uncleanMetadataPath)

    console.log('10. All processing complete, sending response')
    res.status(200).json({
      localVideoPath: videoFile.filepath,
      localAudioPath: audioPath,
      localImagePath: imagePath,
      metadata,
      lyrics,
      ipfsHashes: ipfsResult,
      twitterUrl: twitterResult.firstTweetUrl
    })

  } catch (error) {
    console.error('Error in process-video:', error)
    console.error('Stack trace:', error.stack)
    res.status(500).json({ error: 'Failed to process video', details: error.message })
  }
}) 