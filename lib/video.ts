import { spawn } from 'child_process'
import { join } from 'path'
import { mkdirSync, existsSync, copyFileSync } from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'

const DROPBOX_PATHS = {
  VIDEO: '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Video',
  AUDIO: '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Song',
  IMAGE: '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/EverySongADayPNG',
  GIF: '/Users/jonathanmann/SongADAO Dropbox/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Gif'
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

export async function processVideoForBluesky(videoPath: string, songNumber: string): Promise<string> {
  const outputDir = join(process.cwd(), 'output', songNumber)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = join(outputDir, 'bluesky.mp4')

  // Get video duration first
  const duration = await getVideoDuration(videoPath)
  console.log('Original video duration:', duration, 'seconds')

  return new Promise((resolve, reject) => {
    let ffmpegCommand = ffmpeg(videoPath)
      .size('1080x1920') // Bluesky's preferred vertical video format
      .videoBitrate('2000k')
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .fps(30)

    // If video is longer than 60 seconds, trim it
    if (duration > 60) {
      console.log('Video longer than 60 seconds, trimming...')
      ffmpegCommand = ffmpegCommand.setDuration(60)
    }

    ffmpegCommand
      .on('end', () => {
        console.log('Bluesky video processing complete')
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('Error processing video for Bluesky:', err)
        reject(err)
      })
      .save(outputPath)
  })
}

export async function processVideoForFarcaster(videoPath: string, songNumber: string): Promise<{
  manifestPath: string;
  thumbnailPath: string;
  outputDir: string;
}> {
  const outputDir = join(process.cwd(), 'output', songNumber, 'farcaster');
  
  // Create main output directory
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Create resolution subdirectories
  const resolutions = [
    {
      name: '480p',
      scale: '854:480',
      bandwidth: '2444200',
      codecs: 'avc1.64001f,mp4a.40.2'
    },
    {
      name: '720p',
      scale: '1280:720',
      bandwidth: '4747600',
      codecs: 'avc1.640020,mp4a.40.2'
    }
  ];

  for (const res of resolutions) {
    const resDir = join(outputDir, res.name);
    if (!existsSync(resDir)) {
      mkdirSync(resDir, { recursive: true });
    }
  }

  const thumbnailPath = join(outputDir, 'thumbnail.jpg');
  const manifestPath = join(outputDir, 'manifest.m3u8');

  // Get video duration first
  const duration = await getVideoDuration(videoPath);
  console.log('Original video duration:', duration, 'seconds');

  // Create thumbnail from middle of video
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: 'thumbnail.jpg',
        folder: outputDir,
        size: '1280x720'  // Changed from 1280:720 to 1280x720
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // Process each resolution sequentially
  for (const resolution of resolutions) {
    console.log(`Starting ${resolution.name} conversion...`);
    await new Promise((resolve, reject) => {
      let command = ffmpeg(videoPath)
        .outputOptions([
          '-c:v libx264',          // Video codec
          '-c:a aac',              // Audio codec
          '-preset fast',          // Encoding preset
          '-movflags +faststart',  // Optimize for web playback
          `-vf scale=${resolution.scale}:force_original_aspect_ratio=disable`,  // Force scale
          '-f hls',
          '-hls_time 10',
          '-hls_list_size 0',
          '-hls_segment_type mpegts',
          '-hls_playlist_type vod'
        ]);

      // If video is longer than 300 seconds (5 minutes), trim it
      if (duration > 300) {
        console.log(`Video longer than 300 seconds, trimming for ${resolution.name}...`);
        command = command.setDuration(300);
      }

      command
        .output(join(outputDir, resolution.name, 'video.m3u8'))
        .on('start', (commandLine) => {
          console.log(`FFmpeg spawned with command: ${commandLine}`);
        })
        .on('stderr', (stderrLine) => {
          console.log('FFmpeg stderr:', stderrLine);
        })
        .on('progress', (progress) => {
          console.log(`Processing ${resolution.name}: ${progress.percent}% done`);
        })
        .on('end', () => {
          console.log(`Finished processing ${resolution.name}`);
          resolve(null);
        })
        .on('error', (err, stdout, stderr) => {
          console.error(`Error processing ${resolution.name}:`, err);
          console.error('stdout:', stdout);
          console.error('stderr:', stderr);
          reject(err);
        })
        .run();
    });
  }

  // Create master playlist with proper codec information
  const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:3

#EXT-X-STREAM-INF:BANDWIDTH=2444200,CODECS="avc1.64001f,mp4a.40.2",RESOLUTION=854x480
480p/video.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4747600,CODECS="avc1.640020,mp4a.40.2",RESOLUTION=1280x720
720p/video.m3u8`;

  fs.writeFileSync(manifestPath, masterPlaylist);

  return {
    manifestPath,
    thumbnailPath,
    outputDir
  };
}