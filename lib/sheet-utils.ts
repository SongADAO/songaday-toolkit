import { google } from 'googleapis'
import { readFileSync } from 'fs'
import { join } from 'path'

const SPREADSHEET_ID = '1vA4Hw8S5bXpxl4zRq6JiAmaynOnEtfVAo8k15t57iMI'
const SHEETS_CLIENT_SECRET = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/python_scripts/home for wayward files needed in scripts/client_secret_717772408281-lt7t2iajs42un4drqv5eqqnrr6lqh0b3.apps.googleusercontent.com.json'
const SHEETS_TOKEN_PATH = join(process.cwd(), 'sheets-oauth-token.json')

export async function updateSongSheet({
  songNumber,
  date,
  lyrics,
  youtubeUrl
}: {
  songNumber: string
  date: string
  lyrics?: string
  youtubeUrl?: string
}) {
  try {
    // Load client secrets
    const credentials = JSON.parse(readFileSync(SHEETS_CLIENT_SECRET, 'utf8'))
    const { client_secret, client_id } = credentials.installed

    // Create OAuth2 client
    const auth = new google.auth.OAuth2(client_id, client_secret)
    
    // Load saved credentials
    const token = JSON.parse(readFileSync(SHEETS_TOKEN_PATH, 'utf8'))
    auth.setCredentials(token)

    const sheets = google.sheets({ version: 'v4', auth })
    
    // Parse the date, fallback to today if there's an issue
    let dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      console.log('Debug - Invalid date provided:', date)
      dateObj = new Date() // Fallback to today
    }
    console.log('Debug - Using date:', dateObj)
    
    // Hardcode the year to 2025 and tab to YR17
    const year = 2025
    const tabName = 'YR17'
    console.log('Debug - Using hardcoded year:', year)
    console.log('Debug - Using hardcoded tab:', tabName)

    // Check if the sheet exists
    try {
      await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
        ranges: [`${tabName}!A1`],
      })
    } catch (error) {
      // Sheet doesn't exist, create it
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: tabName,
                gridProperties: {
                  rowCount: 367,
                  columnCount: 23
                }
              }
            }
          }]
        }
      })
    }
    
    // Calculate day of year accounting for leap years
    const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
    const start = new Date(year, 0, 0)
    const diff = dateObj.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    const dayOfYear = Math.floor(diff / oneDay)
    
    // Add 2 for normal years (1 for header + 1 for day offset), 3 for leap years (1 for header + 2 for day offset)
    const row = dayOfYear + (isLeapYear ? 3 : 2)
    console.log('Debug - Final row number:', row)

    const updates = []

    // YouTube URL goes in column T
    if (youtubeUrl) {
      updates.push({ 
        range: `'${tabName}'!T${row}`, 
        values: [[youtubeUrl]] 
      })
    }

    // Lyrics go in column U
    if (lyrics) {
      updates.push({ 
        range: `'${tabName}'!U${row}`, 
        values: [[lyrics]] 
      })
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates
        }
      })
    }

    return true
  } catch (error) {
    console.error('Error updating sheet:', error)
    throw error
  }
} 