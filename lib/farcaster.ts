import {
  makeCastAdd,
  NobleEd25519Signer,
  FarcasterNetwork,
  CastAddBody,
  getSSLHubRpcClient,
  Embed
} from '@farcaster/hub-nodejs';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read config file
const config = JSON.parse(readFileSync(join(process.cwd(), 'config.json'), 'utf8'));

// Create a simple logging interface
const logging = {
  info: (...args: any[]) => console.log(...args),
  error: (...args: any[]) => console.error(...args)
};

// Helper function to convert hex to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  hex = hex.replace('0x', '');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export class FarcasterPoster {
  private signer: NobleEd25519Signer;
  private client: ReturnType<typeof getSSLHubRpcClient>;
  private initialized: boolean = false;

  constructor() {
    this.client = getSSLHubRpcClient('hub-grpc.pinata.cloud', {
      network: FarcasterNetwork.MAINNET
    });
  }

  async initialize() {
    try {
      if (!config.FARCASTER_PRIVATE_KEY || !config.FARCASTER_FID) {
        throw new Error('Farcaster credentials not found in config.json');
      }

      const privateKeyBytes = hexToBytes(config.FARCASTER_PRIVATE_KEY);
      this.signer = new NobleEd25519Signer(privateKeyBytes);

      // Verify the signer
      const signerKey = await this.signer.getSignerKey();
      if (signerKey.isErr()) {
        throw new Error(`Failed to verify signer: ${signerKey.error}`);
      }

      logging.info('Successfully initialized Farcaster client');
      this.initialized = true;
      return true;
    } catch (err) {
      logging.error('Failed to initialize Farcaster client:', err);
      return false;
    }
  }

  async postWithVideo(text: string, videoUrl: string, thumbnailUrl: string) {
    if (!this.initialized) {
      throw new Error('Farcaster client not initialized');
    }

    try {
      const cast = await makeCastAdd(
        {
          text,
          embeds: [
            {
              url: videoUrl,
              mimeType: "application/vnd.apple.mpegurl",
              metadata: {
                thumbnailUrl
              }
            } as Embed
          ],
          embedsDeprecated: [],
          mentions: [],
          mentionsPositions: [],
          type: 0
        } as CastAddBody,
        {
          fid: config.FARCASTER_FID,
          network: FarcasterNetwork.MAINNET,
        },
        this.signer
      );

      if (cast.isOk()) {
        const submitResult = await this.client.submitMessage(cast.value);
        
        if (submitResult.isOk()) {
          const hashHex = Buffer.from(cast.value.hash).toString('hex');
          logging.info('Successfully posted to Farcaster. Cast hash:', hashHex);
          return {
            success: true,
            hash: hashHex,
            url: `https://warpcast.com/${config.FARCASTER_USERNAME}` // URL to the cast
          };
        } else {
          throw new Error(`Failed to submit cast to hub: ${submitResult.error}`);
        }
      } else {
        throw new Error(`Failed to create cast: ${cast.error}`);
      }
    } catch (err) {
      logging.error('Error posting to Farcaster:', err);
      throw err;
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
  }
} 