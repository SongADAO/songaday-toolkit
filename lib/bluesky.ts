import { BskyAgent, RichText } from '@atproto/api'
import { readFile } from 'fs/promises'
import { processVideoForBluesky } from './video'
import { readFileSync } from 'fs'
import { join } from 'path'

// Read config file
const config = JSON.parse(readFileSync(join(process.cwd(), 'config.json'), 'utf8'))

// Create a simple logging interface
const logging = {
  info: (...args: any[]) => console.log(...args),
  error: (...args: any[]) => console.error(...args)
}

export class BlueskyPoster {
  private agent: BskyAgent

  constructor() {
    this.agent = new BskyAgent({
      service: 'https://bsky.social'
    })
  }

  async initialize() {
    try {
      if (!config.BLUESKY_IDENTIFIER || !config.BLUESKY_PASSWORD) {
        throw new Error('Bluesky credentials not found in config.json')
      }

      await this.agent.login({
        identifier: config.BLUESKY_IDENTIFIER,
        password: config.BLUESKY_PASSWORD
      })
      logging.info('Successfully authenticated with Bluesky')
      return true
    } catch (err) {
      logging.error('Failed to authenticate with Bluesky:', err)
      return false
    }
  }

  async postWithVideo(text: string, videoPath: string, songNumber: string) {
    try {
      // Process video for Bluesky's requirements
      const processedVideoPath = await processVideoForBluesky(videoPath, songNumber)
      logging.info('Video processed for Bluesky:', processedVideoPath)

      // Read the processed video file and convert to Uint8Array
      const videoData = await readFile(processedVideoPath)
      const videoUint8Array = new Uint8Array(videoData.buffer)

      // Upload the video
      const uploadResponse = await this.agent.uploadBlob(videoUint8Array, {
        encoding: 'video/mp4'
      })

      // Process text to include rich text features
      const richText = new RichText({ text })
      await richText.detectFacets(this.agent) // This will detect links, mentions, and tags

      // Create the post with the video and rich text
      const result = await this.agent.post({
        text: richText.text,
        facets: richText.facets,
        embed: {
          $type: 'app.bsky.embed.video',
          video: uploadResponse.data.blob
        }
      })

      logging.info('Successfully posted to Bluesky:', result)
      return result
    } catch (err) {
      logging.error('Error posting to Bluesky:', err)
      throw err
    }
  }

  async post(text: string) {
    try {
      // Process text to include rich text features
      const richText = new RichText({ text })
      await richText.detectFacets(this.agent)

      const result = await this.agent.post({
        text: richText.text,
        facets: richText.facets
      })
      logging.info('Successfully posted to Bluesky:', result)
      return result
    } catch (err) {
      logging.error('Error posting to Bluesky:', err)
      throw err
    }
  }
} 