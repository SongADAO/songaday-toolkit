import { NextApiRequest, NextApiResponse } from 'next'
import { withSession } from '@/lib/session'
import { processVideo } from '@/lib/video'
import { transcribeAudio } from '@/lib/assembly'
import { updateSongSheet } from '@/lib/sheet-utils'
import { join } from 'path'
import { existsSync } from 'fs'
import formidable from 'formidable'
import { saveToDropbox } from '@/lib/file-utils'
import { 
  saveInitialMetadata, 
  updateInitialMetadata, 
  saveFinalMetadata,
  InitialMetadata,
  SongSheetUpdate
} from '@/lib/metadata'
import { uploadToYoutube } from '@/lib/youtube'
import ffmpeg from 'fluent-ffmpeg'
import { uploadToIPFSAndFormatMetadata } from '@/lib/ipfs-utils'
import { postTweetThread } from '@/lib/twitter'
import { BlueskyPoster } from '@/lib/bluesky'
import fs from 'fs'
import { FarcasterPoster } from '@/lib/farcaster'
import { processVideoForFarcaster } from '@/lib/video'
import { uploadFolderToPinata } from '@/lib/pinata-utils'
import { checkYouTubeAuth } from '@/lib/youtube'
import readline from 'readline'
import { handleYouTubeAuth } from '@/lib/youtube'
import { exec } from 'child_process'

type FormidableParseResult = {
  files: formidable.Files;
  fields: formidable.Fields;
};

export const config = {
  api: {
    bodyParser: false,
  },
}

const LYRICS_PATH = '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/SONG A DAY LYRICS CHORDS'

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

    const videoFile = files.file
    if (!videoFile || Array.isArray(videoFile)) {
      console.error('No valid video file found in request')
      return res.status(400).json({ error: 'Missing or invalid video file' })
    }

    console.log('3. Parsing metadata...')
    const metadata = JSON.parse(fields.data as string)

    // Get tweet preferences first
    console.log('4. Getting tweet preferences...')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const tweetCount = await new Promise<string>((resolve) => {
      rl.question('One tweet or two? Enter 1 or 2: ', (answer) => {
        rl.close()
        resolve(answer.trim())
      })
    })

    if (tweetCount !== '1' && tweetCount !== '2') {
      return res.status(400).json({ error: 'Invalid tweet count. Must be 1 or 2.' })
    }

    metadata.tweetCount = tweetCount
    console.log('Set tweet count in metadata:', metadata.tweetCount)

    // Get tweet text
    console.log('5. Getting tweet text...')
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const tweetText = await new Promise<string>((resolve) => {
      rl2.question('Enter your tweet text: ', (answer) => {
        rl2.close()
        resolve(answer)
      })
    })

    metadata.description = tweetText
    console.log('Tweet text:', metadata.description)

    // Check YouTube auth status and handle CLI auth if needed
    console.log('Checking YouTube authentication...')
    try {
      const { needsAuth, authUrl } = await checkYouTubeAuth()
      if (needsAuth) {
        console.log('\nYouTube authentication required.')
        console.log('1. Visit this URL to authorize:')
        console.log(authUrl)
        console.log('\n2. After authorizing, you will see a code.')
        console.log('3. Copy that code and paste it below.\n')

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        })

        const code = await new Promise<string>((resolve) => {
          rl.question('Enter the code from the page: ', (code) => {
            rl.close()
            resolve(code)
          })
        })

        await handleYouTubeAuth(code)
      }
    } catch (error) {
      console.error('Error with YouTube authentication:', error)
      return res.status(500).json({ error: 'Failed to authenticate with YouTube' })
    }
    console.log('YouTube authentication verified')

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
      date: metadata.date,
      lyrics,
      youtubeUrl: metadata.youtubeUrl
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

    // Post to Bluesky
    console.log('Attempting to post to Bluesky...')
    try {
      const blueskyPoster = new BlueskyPoster()
      const initialized = await blueskyPoster.initialize()
      
      if (!initialized) {
        console.log('Skipping Bluesky post - Could not initialize Bluesky client')
      } else {
        const blueskyText = `🎵 Song A Day #${metadata.songNbr}: ${metadata.title}\n\n${metadata.description || ''}\n\nWatch on YouTube: ${youtubeResult.url}`
        
        await blueskyPoster.postWithVideo(
          blueskyText,
          videoFile.filepath,
          metadata.songNbr
        )
        console.log('Successfully posted to Bluesky')
      }
    } catch (error) {
      console.log('Skipping Bluesky post due to error:', error.message)
      // Continue with the rest of the process
    }

    // Post to Farcaster
    let farcasterUrl: string | undefined;
    console.log('Attempting to post to Farcaster...')
    try {
      const farcasterPoster = new FarcasterPoster()
      const initialized = await farcasterPoster.initialize()
      
      if (!initialized) {
        console.log('Skipping Farcaster post - Could not initialize Farcaster client')
      } else {
        try {
          // Process video for Farcaster
          console.log('Processing video for Farcaster...')
          const { manifestPath, thumbnailPath, outputDir } = await processVideoForFarcaster(
            videoFile.filepath,
            metadata.songNbr
          )
          console.log('Video processed for Farcaster successfully')

          // Upload the HLS directory to IPFS via Pinata
          console.log('Uploading HLS directory to IPFS...')
          const ipfsHash = await uploadFolderToPinata(outputDir)
          console.log('Successfully uploaded to IPFS with hash:', ipfsHash)
          
          // Construct the URLs using the whitelisted gateway
          const videoUrl = `https://songaday.mypinata.cloud/ipfs/${ipfsHash}/manifest.m3u8`
          const thumbnailUrl = `https://songaday.mypinata.cloud/ipfs/${ipfsHash}/thumbnail.jpg`

          const farcasterText = `${metadata.description || ''}\nsongaday.world/${metadata.songNbr}`
          
          // Create frameUrl for the songaday.world link
          const frameUrl = `https://songaday.world/${metadata.songNbr}`
          
          console.log('Posting to Farcaster...')
          const farcasterResult = await farcasterPoster.postWithVideo(
            farcasterText,
            videoUrl,
            thumbnailUrl,
            frameUrl // Pass the frame URL for Farcaster frames functionality
          )
          console.log('Successfully posted to Farcaster:', farcasterResult)
          farcasterUrl = farcasterResult.url

          // Add Farcaster URL to metadata
          if (farcasterUrl) {
            await updateInitialMetadata(metadata.songNbr, { 
              farcasterUrl 
            })
            console.log('Added Farcaster URL to metadata')
          }
        } catch (innerError) {
          console.error('Error during Farcaster processing/posting:', innerError)
          console.log('Continuing with the rest of the process...')
        } finally {
          // Always try to close the Farcaster client
          try {
            await farcasterPoster.close()
          } catch (closeError) {
            console.error('Error closing Farcaster client:', closeError)
          }
        }
      }
    } catch (error) {
      console.error('Fatal error in Farcaster section:', error)
      console.log('Continuing with the rest of the process...')
    }

    // Continue with IPFS upload and metadata formatting
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

    // Open the auctions page with metadata hash and song number
    const auctionsUrl = `http://localhost/auctions/create-gbm-l2-base?metadataHash=${ipfsResult.metadataHash}&songNumber=${metadata.songNbr}`
    console.log('Opening auctions page:', auctionsUrl)
    exec(`open "${auctionsUrl}"`)

    console.log('Posting to Twitter...')
    console.log('Tweet count value:', metadata.tweetCount || 'undefined')
    
    // Ensure tweetCount is properly set before posting
    const tweetCountToUse = metadata.tweetCount || '2'  // Default to 2 if somehow missing
    console.log('Using tweet count:', tweetCountToUse)
    
    const twitterResult = await postTweetThread({
      videoPath: videoFile.filepath,
      description: metadata.description || '',
      songNumber: metadata.songNbr,
      imagePath: imagePath,
      tweetCount: tweetCountToUse
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