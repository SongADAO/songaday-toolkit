import { processVideoForFarcaster } from '../lib/video';
import { uploadFolderToPinata } from '../lib/pinata-utils';
import { FarcasterPoster } from '../lib/farcaster';
import readline from 'readline';

const VIDEO_PATH = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/Song A Day 2025_working/February/18/18 I Am A Piece of Bread.mov';
const SONG_NUMBER = '5893';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify the question function
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function testFarcasterPipeline() {
  try {
    // Get tweet text from user
    const tweetText = await question('Enter the tweet text for this song: ');
    rl.close();

    // 1. Process video for Farcaster (HLS conversion)
    console.log('\n1. Starting video processing for Farcaster...');
    const { manifestPath, thumbnailPath, outputDir } = await processVideoForFarcaster(
      VIDEO_PATH,
      SONG_NUMBER
    );
    console.log('Video processing complete!');
    console.log('Output directory:', outputDir);
    console.log('Manifest path:', manifestPath);
    console.log('Thumbnail path:', thumbnailPath);

    // 2. Upload to IPFS via Pinata
    console.log('\n2. Uploading to IPFS...');
    const ipfsHash = await uploadFolderToPinata(outputDir);
    console.log('Successfully uploaded to IPFS!');
    console.log('IPFS Hash:', ipfsHash);

    // Construct the URLs using the whitelisted gateway
    const videoUrl = `https://songaday.mypinata.cloud/ipfs/${ipfsHash}/manifest.m3u8`;
    const thumbnailUrl = `https://songaday.mypinata.cloud/ipfs/${ipfsHash}/thumbnail.jpg`;
    console.log('Video URL:', videoUrl);
    console.log('Thumbnail URL:', thumbnailUrl);

    // 3. Post to Farcaster
    console.log('\n3. Posting to Farcaster...');
    const farcasterPoster = new FarcasterPoster();
    const initialized = await farcasterPoster.initialize();

    if (!initialized) {
      throw new Error('Failed to initialize Farcaster client');
    }

    // Construct Farcaster post with the correct structure
    const farcasterText = `${tweetText}\nsongaday.world/${SONG_NUMBER}`;
    
    const result = await farcasterPoster.postWithVideo(
      farcasterText,
      videoUrl,
      thumbnailUrl
    );

    console.log('Successfully posted to Farcaster!');
    console.log('Post URL:', result.url);
    console.log('Cast hash:', result.hash);

  } catch (error) {
    console.error('Error in Farcaster pipeline:', error);
  }
}

// Run the test
testFarcasterPipeline().catch(console.error); 