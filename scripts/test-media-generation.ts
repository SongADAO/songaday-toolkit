import { processVideo } from '../lib/video'
import { uploadToIPFSAndFormatMetadata } from '../lib/ipfs-utils'
import { saveFinalMetadata } from '../lib/metadata'
import { join } from 'path'
import { existsSync } from 'fs'

async function testMediaGeneration() {
  try {
    // Test video path - you can modify this to test with a different video
    const testVideoPath = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Video/5747.mp4'
    const testSongNumber = '5747'

    console.log('Starting media generation test...')
    console.log('Input video path:', testVideoPath)
    console.log('Song number:', testSongNumber)

    if (!existsSync(testVideoPath)) {
      throw new Error(`Test video not found at path: ${testVideoPath}`)
    }

    // Step 1: Process Video and Generate Media
    console.log('\nStep 1: Processing video and generating media...')
    const result = await processVideo(testVideoPath, testSongNumber)

    console.log('\nMedia generation completed!')
    console.log('Generated files:')
    console.log('Video:', result.videoPath)
    console.log('Audio:', result.audioPath)
    console.log('Image:', result.imagePath)
    console.log('GIF:', result.gifPath)

    // Verify files exist
    console.log('\nVerifying files...')
    const files = [result.videoPath, result.audioPath, result.imagePath, result.gifPath]
    files.forEach(file => {
      const exists = existsSync(file)
      console.log(`${file}: ${exists ? 'EXISTS' : 'MISSING'}`)
    })

    // Step 2: Upload to IPFS and Create Metadata
    console.log('\nStep 2: Uploading to IPFS and creating metadata...')
    const testMetadata = {
      songNbr: testSongNumber,
      title: 'Test Song',
      date: '2024-01-19',
      description: 'Test description',
      location: 'Test Location',
      topic: 'Test Topic',
      instrument: 'Test Instrument',
      mood: 'Test Mood',
      genre: 'Test Genre',
      style: 'Test Style',
      youtubeUrl: 'https://youtube.com/test'
    }

    const ipfsResult = await uploadToIPFSAndFormatMetadata(
      testMetadata,
      result.videoPath,
      result.audioPath,
      result.imagePath,
      result.gifPath,
      'Test lyrics for the song'
    )

    console.log('\nIPFS Upload Results:')
    console.log('Video Hash:', ipfsResult.videoHash)
    console.log('Audio Hash:', ipfsResult.audioHash)
    console.log('Image Hash:', ipfsResult.imageHash)
    console.log('GIF Hash:', ipfsResult.gifHash)
    console.log('Metadata Hash:', ipfsResult.metadataHash)

    // Step 3: Save Final Metadata to Dropbox
    console.log('\nStep 3: Saving final metadata to Dropbox...')
    const finalMetadata = {
      ...testMetadata,
      ipfsHashes: ipfsResult
    }

    const metadataPath = await saveFinalMetadata(testSongNumber, finalMetadata)
    console.log('Final metadata saved to:', metadataPath)

    console.log('\nAll tests completed successfully!')

  } catch (error) {
    console.error('Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testMediaGeneration() 