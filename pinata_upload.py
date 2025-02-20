import os
import requests
from pathlib import Path
from tqdm import tqdm

# Store API key in environment variable for security
PINATA_API_KEY = os.getenv('ffc81b0ac8f6bb4481e6')
PINATA_SECRET_KEY = os.getenv('becd8251a7588c37c45cf29346cc0981c2e754b3694bdaa6412a818787ccb817')

# Directory containing DZI files
DZI_DIR = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/python_scripts/songaday_thumbnails_dzi'

def upload_to_pinata(filepath):
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    
    headers = {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
    }
    
    try:
        with open(filepath, 'rb') as file:
            files = {
                'file': file
            }
            response = requests.post(url, files=files, headers=headers)
            
            if response.status_code == 200:
                return response.json()['IpfsHash']
            else:
                print(f"Error uploading {filepath}: {response.text}")
                return None
    except Exception as e:
        print(f"Error with {filepath}: {str(e)}")
        return None

def main():
    # Get total number of files for progress bar
    total_files = sum([len(files) for _, _, files in os.walk(DZI_DIR)])
    
    print(f"Found {total_files} files to upload")
    
    # Create progress bar
    with tqdm(total=total_files) as pbar:
        for root, dirs, files in os.walk(DZI_DIR):
            for file in files:
                filepath = os.path.join(root, file)
                hash = upload_to_pinata(filepath)
                if hash:
                    print(f"Uploaded {filepath} - IPFS Hash: {hash}")
                pbar.update(1)

if __name__ == "__main__":
    if not PINATA_API_KEY or not PINATA_SECRET_KEY:
        print("Please set PINATA_API_KEY and PINATA_SECRET_KEY environment variables")
        exit(1)
    main()