import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PATHS } from './paths'
import readline from 'readline'

const TOKEN_PATH = join(process.cwd(), 'youtube-oauth-token.json')
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube'
]

export async function getAuthenticatedClient(): Promise<OAuth2Client> {
  try {
    const credentials = JSON.parse(readFileSync(PATHS.YOUTUBE_CLIENT_SECRET, 'utf8'))
    const { client_secret, client_id } = credentials.installed

    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      'urn:ietf:wg:oauth:2.0:oob'
    )

    // Check if we have previously stored a token
    if (existsSync(TOKEN_PATH)) {
      console.log('Found existing token at:', TOKEN_PATH)
      const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'))
      
      // Check if token has refresh_token
      if (!token.refresh_token) {
        console.log('Token exists but has no refresh token, getting new token...')
        return getNewToken(oauth2Client)
      }

      oauth2Client.setCredentials(token)

      // Check if token is expired
      if (token.expiry_date && token.expiry_date < Date.now()) {
        try {
          console.log('Token expired, attempting refresh...')
          const newToken = await oauth2Client.refreshToken(token.refresh_token)
          oauth2Client.setCredentials(newToken.tokens)
          writeFileSync(TOKEN_PATH, JSON.stringify(newToken.tokens))
          console.log('Token refreshed successfully')
        } catch (error) {
          console.log('Token refresh failed, getting new token...')
          return getNewToken(oauth2Client)
        }
      }

      return oauth2Client
    }

    console.log('No token found at:', TOKEN_PATH)
    return getNewToken(oauth2Client)
  } catch (error) {
    console.error('Error in getAuthenticatedClient:', error)
    throw error
  }
}

async function getNewToken(oauth2Client: OAuth2Client): Promise<OAuth2Client> {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'  // Force prompt to ensure we get a refresh token
  })

  console.log('\n1. Visit this URL to authorize the application:')
  console.log('\n', authUrl)
  console.log('\n2. After authorizing, you will see a code on the page')
  console.log('3. Copy that code and paste it below\n')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const code = await new Promise<string>((resolve) => {
    rl.question('Enter the code shown on the page: ', (code) => {
      rl.close()
      resolve(code)
    })
  })

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
    console.log('\nSuccess! YouTube token stored to', TOKEN_PATH)
    return oauth2Client
  } catch (err) {
    console.error('Error getting YouTube oAuth token:', err)
    throw err
  }
}

// Utility function to check if current token is valid
export async function validateToken(): Promise<boolean> {
  try {
    const oauth2Client = await getAuthenticatedClient()
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })
    
    // Try to make a simple API call
    await youtube.channels.list({
      part: ['snippet'],
      mine: true
    })
    
    return true
  } catch (error) {
    console.error('Token validation failed:', error)
    return false
  }
} 