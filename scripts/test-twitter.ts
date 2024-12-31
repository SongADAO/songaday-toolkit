import { postTweetThread } from '../lib/twitter'
import { join } from 'path'

async function testTwitterUpload() {
  try {
    // Test video path - you can modify this to test different videos
    const testVideoPath = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Video/5747.mp4'
    
    // Test metadata
    const testDescription = "This is a test description"
    const testSongNumber = 5747

    console.log('Starting Twitter test upload...')
    console.log(`Video path: ${testVideoPath}`)

    const result = await postTweetThread({
      videoPath: testVideoPath,
      description: testDescription,
      songNumber: testSongNumber
    })

    console.log('Upload successful!')
    console.log('Tweet URL:', result.firstTweetUrl)

  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testTwitterUpload() 