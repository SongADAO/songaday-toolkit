import { readFileSync } from 'fs';
import { join } from 'path';
import FormData from 'form-data';
import axios from 'axios';
import { read } from 'recursive-fs';
import basePathConverter from 'base-path-converter';
import fs from 'fs';

// Read config file
const config = JSON.parse(readFileSync(join(process.cwd(), 'config.json'), 'utf8'));

const PINATA_API_URL = 'https://api.pinata.cloud';

export async function uploadFolderToPinata(folderPath: string): Promise<string> {
  try {
    console.log('Starting folder upload to Pinata...');
    
    // Verify the folder exists
    if (!fs.existsSync(folderPath)) {
      throw new Error(`Folder not found: ${folderPath}`);
    }

    // Read all files from the directory
    const { files } = await read(folderPath);
    console.log('Found files:', files);

    // Create form data
    const formData = new FormData();
    
    // Add each file individually with the correct filepath
    for (const file of files) {
      console.log(`Adding file: ${file}`);
      formData.append('file', fs.createReadStream(file), {
        filepath: basePathConverter(folderPath, file)
      });
    }
    
    // Add metadata
    const metadata = {
      name: `Song A Day Warpcast Video - ${folderPath.split('/').pop()}`,
      keyvalues: {
        type: 'warpcast-video',
        date: new Date().toISOString()
      }
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));
    
    // Add options for faster pinning
    const options = {
      cidVersion: 1
    };
    formData.append('pinataOptions', JSON.stringify(options));
    
    console.log('Uploading to Pinata...');
    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${config.PINATA_JWT}`,
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    console.log('Upload successful!');
    console.log('IPFS Hash:', response.data.IpfsHash);
    return response.data.IpfsHash;
    
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Pinata API error:', error.response.data);
      throw new Error(`Pinata API error (${error.response.status}): ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
} 