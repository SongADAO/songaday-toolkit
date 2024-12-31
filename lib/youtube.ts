import { google } from 'googleapis'
import { getAuthenticatedClient } from './youtube-auth'
import fs from 'fs'

interface UploadOptions {
  videoPath: string
  title: string
  songNumber: string
  description?: string
  lyrics?: string
  tags?: string[]
}

export async function uploadToYoutube({
  videoPath,
  title,
  songNumber,
  description = '',
  lyrics = '',
  tags = []
}: UploadOptions) {
  try {
    const oauth2Client = await getAuthenticatedClient()
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

    // Format description according to template
    const videoDescription = `[description]
${description}

You can find this and all Song A Day songs over at:
http://songaday.world

[lyrics]
${lyrics}

Join the Discord: https://enter.songaday.world/
Website: http://jonathanmann.net
Spotify: http://bit.ly/SADspotify
Bandcamp: http://jonathanmann.bandcamp.com
Instagram: http://instagram.com/jonathanmann
Twitter: http://twitter.com/songadaymann
Speaking: http://jonathanmann.net/conf
Theme songs: http://jonathanmann.net/themes`

    const fileSize = fs.statSync(videoPath).size

    const res = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: `${title} | Song A Day #${songNumber}`,
          description: videoDescription,
          tags: [...tags, 'Song A Day', 'Jonathan Mann']
        },
        status: {
          privacyStatus: 'Public',
          selfDeclaredMadeForKids: false
        }
      },
      media: {
        body: fs.createReadStream(videoPath)
      }
    }, {
      onUploadProgress: evt => {
        const progress = (evt.bytesRead / fileSize) * 100
        console.log(`${Math.round(progress)}% complete`)
      }
    })

    return {
      videoId: res.data.id,
      url: `https://youtube.com/watch?v=${res.data.id}`
    }

  } catch (error) {
    console.error('Error uploading to YouTube:', error)
    throw error
  }
} 