import { spawn } from 'child_process'
import { join } from 'path'
import { mkdirSync, existsSync } from 'fs'

const testFfmpeg = async (videoPath: string, songNumber: string) => {
  // Setup output directory
  const outputDir = join(process.cwd(), 'output', songNumber)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const audioPath = join(outputDir, `${songNumber}.wav`)
  const imagePath = join(outputDir, `${songNumber}.jpg`)

  console.log('Starting test with paths:')
  console.log('Video:', videoPath)
  console.log('Audio output:', audioPath)
  console.log('Image output:', imagePath)

  // Test audio extraction
  console.log('\nTesting audio extraction...')
  const audioProcess = spawn('ffmpeg', [
    '-i', videoPath,
    '-vn',
    '-acodec', 'pcm_s16le',
    '-ar', '44100',
    '-ac', '2',
    audioPath
  ])

  audioProcess.stdout.on('data', (data) => {
    console.log('Audio stdout:', data.toString())
  })

  audioProcess.stderr.on('data', (data) => {
    console.log('Audio stderr:', data.toString())
  })

  await new Promise((resolve, reject) => {
    audioProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Audio extraction completed successfully')
        resolve(null)
      } else {
        reject(new Error(`Audio extraction failed with code ${code}`))
      }
    })
  })

  // Test screenshot extraction
  console.log('\nTesting screenshot extraction...')
  const imageProcess = spawn('ffmpeg', [
    '-i', videoPath,
    '-vf', 'select=eq(n\\,0)',
    '-vframes', '1',
    imagePath
  ])

  imageProcess.stdout.on('data', (data) => {
    console.log('Image stdout:', data.toString())
  })

  imageProcess.stderr.on('data', (data) => {
    console.log('Image stderr:', data.toString())
  })

  await new Promise((resolve, reject) => {
    imageProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Screenshot extraction completed successfully')
        resolve(null)
      } else {
        reject(new Error(`Screenshot extraction failed with code ${code}`))
      }
    })
  })
}

// Run the test with command line arguments
const videoPath = process.argv[2]
const songNumber = process.argv[3]

if (!videoPath || !songNumber) {
  console.error('Usage: ts-node test-ffmpeg.ts <video-path> <song-number>')
  process.exit(1)
}

testFfmpeg(videoPath, songNumber)
  .then(() => {
    console.log('Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Test failed:', error)
    process.exit(1)
  }) 