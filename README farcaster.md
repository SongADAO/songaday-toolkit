# Farcaster Posting Script

A Node.js script for posting to Farcaster using the official SDK.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm
- A Farcaster account with:
  - FID (Farcaster ID)
  - Registered account key (ed25519 key pair)
  - Username

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your account:
   - In `src/test-post.ts`, update:
     - `ACCOUNT_PRIVATE_KEY`: Your registered private key
     - `FID`: Your Farcaster ID
     - `USERNAME`: Your Farcaster username

## Infrastructure Components

### Core Dependencies
- `@farcaster/hub-nodejs`: Official Farcaster Node.js SDK
- `typescript`: TypeScript support
- `ts-node`: TypeScript execution environment

### Network Infrastructure
- **Farcaster Hub**: Connection to Pinata's public Hub (hub-grpc.pinata.cloud)
- **Optimism Network**: Layer 2 network where Farcaster identities live

### Account Components
- **FID**: Your Farcaster identifier
- **Username**: Your Farcaster username
- **Account Key**: ed25519 key pair for signing messages

### Code Components
- `NobleEd25519Signer`: Cryptographic message signing
- `makeCastAdd`: Cast creation
- `getSSLHubRpcClient`: Hub connection
- Utility functions for hex/byte conversion

## Usage

### Making a Test Post
```bash
npm run test
```

### Validating a Cast
```bash
npm run validate <cast-hash>
```

## How It Works

1. **Message Creation**
   - Script creates a signer using your private key
   - Constructs a cast message with your text
   - Signs the message

2. **Message Submission**
   - Connects to Farcaster Hub
   - Submits the signed message
   - Hub propagates to the network

3. **Verification**
   - Use the validate script to check if your cast was received
   - Cast appears on Warpcast and other Farcaster clients

## Files

- `src/test-post.ts`: Main script for creating and submitting posts
- `src/validate-cast.ts`: Script for validating cast submission
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration

## Common Issues

1. **Cast Not Appearing**
   - Check the cast hash with the validate script
   - Allow time for network propagation
   - Verify Hub connection

2. **Validation Errors**
   - Ensure private key is correctly formatted
   - Verify FID matches your account
   - Check Hub connectivity

## Resources

- [Farcaster Protocol Documentation](https://docs.farcaster.xyz/)
- [Farcaster Hub-NodeJS Documentation](https://github.com/farcaster-project/hub-nodejs)
- [Warpcast](https://warpcast.com/) - Web client for viewing posts

## Farcaster Video Integration

The toolkit now supports posting videos to Farcaster with proper HLS (HTTP Live Streaming) format. This ensures optimal video playback on Warpcast.

### Requirements

Add these dependencies to your `package.json`:
```json
{
  "dependencies": {
    "@farcaster/hub-nodejs": "^0.10.21",
    "fluent-ffmpeg": "^2.1.2"
  }
}
```

### Configuration

Add these fields to your `config.json`:
```json
{
  "farcaster": {
    "accountPrivateKey": "your_private_key_here",
    "fid": your_farcaster_id_number,
    "username": "your_farcaster_username"
  }
}
```

### Video Processing for Farcaster

The video processing pipeline for Farcaster requires:
1. Converting video to HLS format with multiple resolutions
   - 854x480 (480p)
   - 1280x720 (720p)
2. Generating a proper manifest file
3. Creating video segments
4. Generating a thumbnail

The processed files structure will be:
```
farcaster_[song_number]/
├── manifest.m3u8          # Main manifest file
├── thumbnail.jpg          # Thumbnail image
├── 480p/
│   ├── video.m3u8        # 480p playlist
│   └── video[0-n].ts     # 480p video segments
└── 720p/
    ├── video.m3u8        # 720p playlist
    └── video[0-n].ts     # 720p video segments
```

### Integration Steps

1. Create a new module in `lib/farcaster.ts` for Farcaster integration
2. Add HLS video processing functions to `lib/video.ts`
3. Update IPFS utilities in `lib/ipfs-utils.ts` to handle directory uploads
4. Add Farcaster posting to your video processing pipeline

### Usage Example

```typescript
import { postToFarcaster } from '../lib/farcaster';
import config from '../config.json';

// In your video processing pipeline
async function processSongVideo(videoPath: string, songNumber: string) {
  // ... existing processing ...

  // Post to Farcaster
  const farcasterResult = await postToFarcaster(
    videoPath,
    `Song A Day #${songNumber} is out now! Check it out at https://songaday.world/${songNumber}`,
    songNumber,
    config.farcaster
  );

  console.log(`Posted to Farcaster: ${farcasterResult.profileUrl}`);
}
```

### Important Notes

1. Video Formatting
   - Videos must be in landscape format
   - Resolutions are fixed at 854x480 and 1280x720
   - No padding or letterboxing is added
   - Aspect ratio is preserved

2. IPFS/Pinata Integration
   - Videos are uploaded to IPFS via Pinata
   - URLs follow the format: `https://songaday.mypinata.cloud/ipfs/[hash]/manifest.m3u8`

3. Farcaster Requirements
   - HLS manifest must include resolution information
   - Thumbnail must be available at the same IPFS hash
   - Video segments must be properly formatted
   - Must be under 5 mins.

For detailed implementation examples, see the test repository at [final-farcaster-test](/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/projects/posting-farcaster/final-farcaster-test).
