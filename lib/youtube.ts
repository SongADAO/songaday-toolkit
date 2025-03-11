import { google } from 'googleapis'
import { getAuthenticatedClient, getOAuth2Client } from './youtube-auth'
import fs from 'fs'
import { TOKEN_PATH } from './youtube-auth'

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
https://songaday.world

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

export async function checkYouTubeAuth(): Promise<{ needsAuth: boolean; authUrl?: string }> {
  try {
    const oauth2Client = await getOAuth2Client()
    
    // Check if we have valid credentials
    const credentials = await oauth2Client.getAccessToken()
    if (credentials && credentials.token) {
      return { needsAuth: false }
    }

    // If no valid credentials, generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload'],
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
    })

    return { 
      needsAuth: true, 
      authUrl 
    }
  } catch (error) {
    console.error('Error checking YouTube auth:', error)
    // If there's an error, assume we need new auth
    const oauth2Client = await getOAuth2Client()
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload'],
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
    })
    return { 
      needsAuth: true, 
      authUrl 
    }
  }
}

export async function handleYouTubeAuth(code: string): Promise<void> {
  try {
    const oauth2Client = await getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    // Save the token
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
    console.log('Successfully authenticated with YouTube')
  } catch (error) {
    console.error('Error handling YouTube auth:', error)
    throw error
  }
} 