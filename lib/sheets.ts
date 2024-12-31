import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { readFileSync } from 'fs'
import { join } from 'path'

const SHEETS_SECRET_PATH = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/python_scripts/home for wayward files needed in scripts/client_secret_717772408281-lt7t2iajs42un4drqv5eqqnrr6lqh0b3.apps.googleusercontent.com.json'
const SHEETS_TOKEN_PATH = join(process.cwd(), 'sheets-oauth-token.json')

export async function appendToSheet(
  spreadsheetId: string,
  range: string,
  values: string[][]
) {
  try {
    // Load client secrets
    const credentials = JSON.parse(readFileSync(SHEETS_SECRET_PATH, 'utf8'))
    const { client_secret, client_id } = credentials.installed

    // Create OAuth2 client
    const auth = new google.auth.OAuth2(client_id, client_secret)
    
    // Load saved credentials
    const token = JSON.parse(readFileSync(SHEETS_TOKEN_PATH, 'utf8'))
    auth.setCredentials(token)

    const sheets = google.sheets({ version: 'v4', auth })

    // Ensure range is properly formatted (e.g., "'2024'!A:Z")
    const formattedRange = range.includes("'") ? range : `'${range}'`

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: formattedRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'OVERWRITE',
      requestBody: {
        values
      }
    })

    return response.data
  } catch (error) {
    console.error('Error appending to sheet:', error)
    throw error
  }
} 