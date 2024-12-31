import pinataSDK from '@pinata/sdk'
import { ensureDir, writeFileSync, copyFileSync, existsSync, mkdirSync, createReadStream } from 'fs-extra'
import { join } from 'path'
import externalConfig from '../config.json'

interface IPFSResult {
  videoHash: string
  audioHash: string
  imageHash: string
  gifHash: string
  metadataHash: string
}

export async function uploadToIPFSAndFormatMetadata(
  metadata: any,
  videoPath: string,
  audioPath: string,
  imagePath: string,
  gifPath: string,
  lyrics?: string
): Promise<IPFSResult> {
  const pinata = new pinataSDK({
    pinataJWTKey: String(externalConfig.PINATA_JWT),
  })

  // Upload video
  console.log('Uploading video to IPFS...')
  const videoRes = await pinata.pinFileToIPFS(createReadStream(videoPath), {
    pinataMetadata: { name: `${metadata.songNbr}_video.mp4` },
    pinataOptions: { cidVersion: 1 }
  })

  // Upload audio
  console.log('Uploading audio to IPFS...')
  const audioRes = await pinata.pinFileToIPFS(createReadStream(audioPath), {
    pinataMetadata: { name: `${metadata.songNbr}_audio.wav` },
    pinataOptions: { cidVersion: 1 }
  })

  // Upload image
  console.log('Uploading image to IPFS...')
  const imageRes = await pinata.pinFileToIPFS(createReadStream(imagePath), {
    pinataMetadata: { name: `${metadata.songNbr}_image.jpg` },
    pinataOptions: { cidVersion: 1 }
  })

  // Upload GIF
  console.log('Uploading GIF to IPFS...')
  const gifRes = await pinata.pinFileToIPFS(createReadStream(gifPath), {
    pinataMetadata: { name: `${metadata.songNbr}_gif.gif` },
    pinataOptions: { cidVersion: 1 }
  })

  // Format metadata
  const attributesArray = [
    { trait_type: 'Date', value: metadata.date },
    { trait_type: 'Location', value: metadata.location || 'N/A' },
    { trait_type: 'Topic', value: metadata.topic || 'N/A' },
    { trait_type: 'Mood', value: metadata.mood || 'N/A' },
    { trait_type: 'Instrument', value: metadata.instrument || 'N/A' },
    { trait_type: 'Genre', value: metadata.genre || 'N/A' },
    { trait_type: 'Style', value: metadata.style || 'N/A' }
  ]

  // Add lyrics if they exist
  if (lyrics) {
    attributesArray.push({ trait_type: 'Lyrics', value: lyrics })
  }

  // Add other instruments and styles using existing pattern
  metadata.otherInstruments?.split(',')
    .map(ins => ins.trim())
    .filter(Boolean)
    .forEach(ins => {
      attributesArray.push({ trait_type: 'Instrument', value: ins })
    })

  metadata.otherStyles?.split(',')
    .map(style => style.trim())
    .filter(Boolean)
    .forEach(style => {
      attributesArray.push({ trait_type: 'Style', value: style })
    })

  const finalMetadata = {
    name: metadata.title,
    description: metadata.description || '',
    created_by: 'Jonathan Mann',
    token_id: Number(metadata.songNbr),
    image: `ipfs://${imageRes.IpfsHash}`,
    animation_url: `ipfs://${videoRes.IpfsHash}`,
    audio_url: `ipfs://${audioRes.IpfsHash}`,
    gif_url: `ipfs://${gifRes.IpfsHash}`,
    external_url: `https://songaday.world/song/${metadata.songNbr}`,
    youtube_url: metadata.youtubeUrl || '',
    attributes: attributesArray
  }

  // Upload final metadata
  console.log('Uploading metadata to IPFS...')
  const metadataRes = await pinata.pinJSONToIPFS(finalMetadata, {
    pinataMetadata: { name: `${metadata.songNbr}.json` },
    pinataOptions: { cidVersion: 1 }
  })

  // Save all hashes and metadata locally
  const outputDir = join(process.cwd(), `/output/${metadata.songNbr}`)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  writeFileSync(join(outputDir, 'video_hash.txt'), videoRes.IpfsHash)
  writeFileSync(join(outputDir, 'audio_hash.txt'), audioRes.IpfsHash)
  writeFileSync(join(outputDir, 'image_hash.txt'), imageRes.IpfsHash)
  writeFileSync(join(outputDir, 'gif_hash.txt'), gifRes.IpfsHash)
  writeFileSync(join(outputDir, 'metadata_hash.txt'), metadataRes.IpfsHash)
  writeFileSync(join(outputDir, 'metadata.json'), JSON.stringify(finalMetadata, null, 2))

  return {
    videoHash: videoRes.IpfsHash,
    audioHash: audioRes.IpfsHash,
    imageHash: imageRes.IpfsHash,
    gifHash: gifRes.IpfsHash,
    metadataHash: metadataRes.IpfsHash
  }
} 