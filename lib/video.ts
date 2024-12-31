import { spawn } from 'child_process'
import { join } from 'path'
import { mkdirSync, existsSync, copyFileSync } from 'fs'
import ffmpeg from 'fluent-ffmpeg'

const DROPBOX_PATHS = {
  VIDEO: '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Video',
  AUDIO: '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Song',
  IMAGE: '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/EverySongADayPNG',
  GIF: '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Gif'
}

// Helper function to get video duration
const getVideoDuration = async (videoPath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata.format.duration || 0);
    });
  });
};

export async function processVideo(videoPath: string, songNumber: string) {
  const videoDestPath = join(DROPBOX_PATHS.VIDEO, `${songNumber}.mp4`)
  const audioPath = join(DROPBOX_PATHS.AUDIO, `${songNumber}.wav`)
  const imagePath = join(DROPBOX_PATHS.IMAGE, `${songNumber}.jpg`)
  const gifPath = join(DROPBOX_PATHS.GIF, `${songNumber}.gif`)

  try {
    // Copy video file to Dropbox
    console.log('Copying video to Dropbox...')
    copyFileSync(videoPath, videoDestPath)
    console.log('Video copied successfully to:', videoDestPath)

    // Extract audio
    await new Promise((resolve, reject) => {
      const audioProcess = spawn('ffmpeg', [
        '-i', videoPath,
        '-vn',
        '-acodec', 'pcm_s16le',
        '-ar', '44100',
        '-ac', '2',
        '-y',
        audioPath
      ])

      audioProcess.stderr.on('data', (data) => {
        console.log('FFmpeg audio stderr:', data.toString())
      })

      audioProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Audio extraction completed successfully')
          resolve(null)
        } else {
          reject(new Error(`Audio extraction failed with code ${code}`))
        }
      })

      audioProcess.on('error', (err) => {
        reject(new Error(`Failed to start FFmpeg process: ${err.message}`))
      })
    })

    // Get video duration and calculate middle point
    const duration = await getVideoDuration(videoPath)
    const middlePoint = duration / 2

    // Extract thumbnail from middle of video
    await new Promise((resolve, reject) => {
      const imageProcess = spawn('ffmpeg', [
        '-ss', middlePoint.toString(),
        '-i', videoPath,
        '-vframes', '1',
        '-y',
        imagePath
      ])

      imageProcess.stderr.on('data', (data) => {
        console.log('FFmpeg image stderr:', data.toString())
      })

      imageProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Screenshot extraction completed successfully')
          resolve(null)
        } else {
          reject(new Error(`Screenshot extraction failed with code ${code}`))
        }
      })
    })

    // Generate GIF from middle of video
    await new Promise((resolve, reject) => {
      const gifProcess = spawn('ffmpeg', [
        '-y',
        '-ss', middlePoint.toString(),
        '-i', videoPath,
        '-t', '1',  // 1 second duration
        '-vf', 'fps=10,scale=320:-1',  // 10 frames, scale width to 320px
        '-loop', '0',
        gifPath
      ])

      gifProcess.stderr.on('data', (data) => {
        console.log('FFmpeg GIF stderr:', data.toString())
      })

      gifProcess.on('close', (code) => {
        if (code === 0) {
          console.log('GIF generation completed successfully')
          resolve(null)
        } else {
          reject(new Error(`GIF generation failed with code ${code}`))
        }
      })
    })

    return {
      videoPath: videoDestPath,
      audioPath,
      imagePath,
      gifPath
    }
  } catch (error) {
    console.error('Error processing video:', error)
    throw error
  }
}