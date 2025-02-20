import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PATHS } from './paths'
import readline from 'readline'

const CREDENTIALS_PATH = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/python_scripts/home for wayward files needed in scripts/client_secret_298332297239-26f4ipajoihjjjtqadu0bnt24kaaqfah.apps.googleusercontent.com.json'
export const TOKEN_PATH = '/Users/jonathanmann/songaday-toolkit/youtube-oauth-token.json'
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube'
]

export async function getOAuth2Client(): Promise<OAuth2Client> {
  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'))
  const { client_secret, client_id, redirect_uris } = credentials.installed

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )

  try {
    const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'))
    oauth2Client.setCredentials(token)
  } catch (error) {
    // Token doesn't exist or is invalid - that's okay, we'll get a new one
    console.log('No valid token found, will need to authenticate')
  }

  return oauth2Client
}

export async function getAuthenticatedClient(): Promise<OAuth2Client> {
  const oauth2Client = await getOAuth2Client()
  
  // Check if we have valid credentials
  try {
    const credentials = await oauth2Client.getAccessToken()
    if (credentials && credentials.token) {
      return oauth2Client
    }
  } catch (error) {
    console.error('Error getting access token:', error)
  }

  throw new Error('No valid credentials available')
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