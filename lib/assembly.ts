import axios from 'axios'
import { createReadStream } from 'fs'

const ASSEMBLY_API_KEY = 'e30dbf3898b245439834a51479f53138'
const ASSEMBLY_API = axios.create({
  baseURL: 'https://api.assemblyai.com/v2',
  headers: {
    authorization: ASSEMBLY_API_KEY,
    'Content-Type': 'application/octet-stream',
  },
  maxBodyLength: Infinity,
  maxContentLength: Infinity
})

function formatLyrics(text: string): string {
  // Add check for empty text
  if (!text || text.trim() === '') {
    return ''
  }

  // Split into words
  const words = text.split(' ')
  let lines: string[] = []
  let currentLine: string[] = []
  let wordCount = 0

  // Helper to check if word starts with capital (excluding personal pronouns)
  const isNewSentence = (word: string) => {
    const personalPronouns = ['I', 'I\'m', 'I\'ll', 'I\'ve', 'I\'d']
    return (
      word[0] === word[0].toUpperCase() && 
      !personalPronouns.includes(word)
    )
  }

  // Helper to flush current line to lines array
  const flushLine = () => {
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '))
      currentLine = []
      wordCount = 0
    }
  }

  words.forEach(word => {
    // Start new line if:
    // 1. Current word starts with capital (except I, I'm, etc)
    // 2. Current line would be longer than 14 words
    if (
      (isNewSentence(word) && currentLine.length > 0) || 
      wordCount >= 14
    ) {
      flushLine()
    }

    currentLine.push(word)
    wordCount++
  })

  // Don't forget the last line
  flushLine()

  // Join lines with newlines
  return lines.join('\n')
}

export async function transcribeAudio(audioPath: string, isInstrumental: boolean = false): Promise<string> {
  // Add early return for instrumentals
  if (isInstrumental) {
    console.log('Skipping transcription for instrumental track')
    return ""
  }

  try {
    // First, upload the file
    const data = createReadStream(audioPath)
    const uploadResponse = await ASSEMBLY_API.post('/upload', data, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    })

    // Then, submit for transcription using the uploaded URL
    const transcriptResponse = await ASSEMBLY_API.post('/transcript', {
      audio_url: uploadResponse.data.upload_url,
      language_detection: true,
    })

    const transcriptId = transcriptResponse.data.id

    // Poll for the transcription result
    while (true) {
      const pollingResponse = await ASSEMBLY_API.get(`/transcript/${transcriptId}`)
      
      console.log('Transcription status:', pollingResponse.data.status)
      
      switch (pollingResponse.data.status) {
        case 'completed':
          // Format the lyrics before returning
          return formatLyrics(pollingResponse.data.text)
        case 'error':
          throw new Error('Transcription failed: ' + pollingResponse.data.error)
        case 'processing':
          await new Promise(resolve => setTimeout(resolve, 3000)) // Wait 3 seconds before polling again
          break
      }
    }
  } catch (error) {
    console.error('Transcription error:', error.response?.data || error)
    throw error
  }
} 