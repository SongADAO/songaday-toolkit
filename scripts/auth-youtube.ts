// @ts-nocheck

const { google } = require('googleapis')
const { writeFileSync } = require('fs')
const { join } = require('path')
const readline = require('readline')

const YOUTUBE_CLIENT_SECRET = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/python_scripts/home for wayward files needed in scripts/client_secret_298332297239-26f4ipajoihjjjtqadu0bnt24kaaqfah.apps.googleusercontent.com.json'
const YOUTUBE_TOKEN_PATH = join(process.cwd(), 'youtube-oauth-token.json')

const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube'
]

async function getNewToken(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: YOUTUBE_SCOPES,
    redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
  })

  console.log('\n1. Visit this URL to authorize the application:')
  console.log('\n', authUrl)
  console.log('\n2. After authorizing, you will see a code on the page')
  console.log('3. Copy that code and paste it below\n')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const code = await new Promise((resolve) => {
    rl.question('Enter the code shown on the page: ', (code) => {
      rl.close()
      resolve(code)
    })
  })

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    writeFileSync(YOUTUBE_TOKEN_PATH, JSON.stringify(tokens))
    console.log('\nSuccess! YouTube token stored to', YOUTUBE_TOKEN_PATH)
  } catch (err) {
    console.error('Error getting YouTube oAuth token:', err)
    throw err
  }
}

async function main() {
  const credentials = require(YOUTUBE_CLIENT_SECRET)
  const { client_secret, client_id } = credentials.installed
  
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'urn:ietf:wg:oauth:2.0:oob'
  )

  await getNewToken(oauth2Client)
}

main().catch(console.error) 