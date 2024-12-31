const { google } = require('googleapis')
const { writeFileSync } = require('fs')
const { join } = require('path')
const http = require('http')
const url = require('url')
const { exec } = require('child_process')

const SHEETS_CLIENT_SECRET = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/python_scripts/home for wayward files needed in scripts/client_secret_717772408281-lt7t2iajs42un4drqv5eqqnrr6lqh0b3.apps.googleusercontent.com.json'
const SHEETS_TOKEN_PATH = join(process.cwd(), 'sheets-oauth-token.json')
const PORT = 3333

const SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets'
]

function openBrowser(url: string) {
  exec(`open "${url}"`)
}

async function getNewToken(oauth2Client) {
  return new Promise((resolve, reject) => {
    // Create a local server to receive the auth code
    const server = http.createServer(async (req, res) => {
      try {
        const parsedUrl = url.parse(req.url, true)
        const code = parsedUrl.query.code

        if (code) {
          // Close the server
          server.close()
          
          // Send a success message to the browser
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end('Authentication successful! You can close this window.')

          // Get the tokens
          const { tokens } = await oauth2Client.getToken(code)
          oauth2Client.setCredentials(tokens)
          
          // Save the tokens
          writeFileSync(SHEETS_TOKEN_PATH, JSON.stringify(tokens))
          console.log('\nSuccess! Sheets token stored to', SHEETS_TOKEN_PATH)
          
          resolve(tokens)
        }
      } catch (err) {
        reject(err)
      }
    })

    server.listen(PORT, () => {
      // Generate the auth url
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SHEETS_SCOPES,
        redirect_uri: `http://localhost:${PORT}`
      })

      console.log('\n1. Opening browser for authorization...')
      openBrowser(authUrl)
      console.log('2. Waiting for authorization...')
    })
  })
}

async function main() {
  const credentials = require(SHEETS_CLIENT_SECRET)
  const { client_secret, client_id } = credentials.installed
  
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    `http://localhost:${PORT}`
  )

  try {
    await getNewToken(oauth2Client)
    console.log('Authorization complete!')
    process.exit(0)
  } catch (err) {
    console.error('Authorization failed:', err)
    process.exit(1)
  }
}

main().catch(console.error) 