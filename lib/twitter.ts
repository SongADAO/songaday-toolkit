import { TwitterApi } from 'twitter-api-v2'
import { readFileSync, statSync } from 'fs'
import { basename, join } from 'path'
import ffmpeg from 'fluent-ffmpeg'
import { createInterface } from 'readline'

const projectPath = process.cwd()

// Create separate clients for v1 and v2
const client = new TwitterApi({
  appKey: 'UHmjMnQmdzIeIDFxDdnFnWPBG',
  appSecret: 'viMO4qiz6Aib1ZZUcY3PelD4gkiOVaLtDRHwdFk1hMyGSDXS4b',
  accessToken: '8632762-4CCTKEzo9anFsySOvu5hLKmRPGirkfsNIyPypjySDr',
  accessSecret: 'IvFJo6eIZNIXB926VGOEUzPqAW8LIjJi3Ol5fRd9EEp7G',
})

const v1Client = client.v1
const v2Client = client.v2

const MAX_VIDEO_DURATION = 140  // 140 seconds
const MAX_VIDEO_SIZE = 512 * 1024 * 1024  // 512MB

async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err)
      resolve(metadata.format.duration || 0)
    })
  })
}

async function processVideoIfNeeded(videoPath: string): Promise<string> {
  const duration = await getVideoDuration(videoPath)
  const fileSize = statSync(videoPath).size

  // If video meets Twitter requirements, return original path
  if (duration <= MAX_VIDEO_DURATION && fileSize <= MAX_VIDEO_SIZE) {
    return videoPath
  }

  console.log('Video needs processing for Twitter...')
  const outputPath = join(projectPath, 'output', `twitter_processed_${Date.now()}.mp4`)

  return new Promise((resolve, reject) => {
    let ffmpegCommand = ffmpeg(videoPath)
      .size('1280x720')
      .videoBitrate('2000k')
      .audioBitrate('128k')

    // If duration exceeds limit, trim video
    if (duration > MAX_VIDEO_DURATION) {
      console.log(`Trimming video to ${MAX_VIDEO_DURATION} seconds...`)
      ffmpegCommand = ffmpegCommand.setDuration(MAX_VIDEO_DURATION)
    }

    ffmpegCommand
      .output(outputPath)
      .on('end', () => {
        console.log('Video processing completed')
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('Error processing video:', err)
        reject(err)
      })
      .run()
  })
}

async function uploadVideo(videoPath: string) {
  try {
    // Process video if needed
    console.log('Checking video requirements...')
    const processedVideoPath = await processVideoIfNeeded(videoPath)
    
    console.log('Uploading video...')
    const mediaId = await v1Client.uploadMedia(processedVideoPath, { 
      mimeType: 'video/mp4',
      target: 'tweet'
    })
    
    // Clean up processed video if it's different from original
    if (processedVideoPath !== videoPath) {
      try {
        const fs = require('fs')
        fs.unlinkSync(processedVideoPath)
        console.log('Cleaned up processed video file')
      } catch (err) {
        console.warn('Could not clean up processed video:', err)
      }
    }
    
    console.log('Video uploaded successfully, media ID:', mediaId)
    return mediaId
  } catch (error) {
    console.error('Error uploading video:', error)
    throw error
  }
}

interface TweetThreadOptions {
  videoPath: string
  description: string
  songNumber: number
  imagePath?: string
}

async function getInitialTweetText(): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question('Enter your tweet text: ', (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

export async function postTweetThread({
  videoPath,
  description,
  songNumber,
  imagePath
}: TweetThreadOptions) {
  try {
    console.log('\nPreparing to post Twitter thread...')
    const initialTweet = await getInitialTweetText()
    
    // Upload video
    console.log('Uploading video to Twitter...')
    const mediaId = await uploadVideo(videoPath)
    
    // Post first tweet with video
    console.log('Posting initial tweet with video...')
    const firstTweet = await v2Client.tweet({
      text: initialTweet,
      media: { media_ids: [mediaId] }
    })

    // Upload image if provided
    let imageMediaId: string | undefined
    if (imagePath) {
      console.log('Uploading image for second tweet...')
      imageMediaId = await v1Client.uploadMedia(imagePath)
    }

    // Post second tweet as reply
    console.log('Posting follow-up tweet...')
    const secondTweetText = `${description}\n\nbid on the 1/1:\nhttps://songaday.world/${songNumber}\n(You get an edition just for bidding)`
    
    await v2Client.tweet({
      text: secondTweetText,
      reply: { in_reply_to_tweet_id: firstTweet.data.id },
      ...(imageMediaId && { media: { media_ids: [imageMediaId] } })
    })

    console.log('Twitter thread posted successfully!')
    return {
      firstTweetId: firstTweet.data.id,
      firstTweetUrl: `https://twitter.com/songadaymann/status/${firstTweet.data.id}`
    }

  } catch (error) {
    console.error('Error posting to Twitter:', error)
    throw error
  }
} 