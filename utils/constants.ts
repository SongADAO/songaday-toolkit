export const ROUTES = [
  {
    path: '/create-image',
    name: 'Create Image',
    description: 'Create a new image and metadata from attributes',
  },
  {
    path: '/upload',
    name: 'Upload to IPFS',
    description: 'Upload anything to IPFS (Video, Image, Metadata)',
  },
  {
    path: '/mint',
    name: 'Mint Song',
    description: 'Mint a new song by giving IPFS hash of the metadata',
  },
  {
    path: '/auctions',
    name: 'Auctions',
    description: 'Create, Start and End the Auction',
  },
  {
    path: '/bulk',
    name: 'Bulk Actions',
    description:
      'Generate images, metadata in bulk by uploading the CSV of the year',
  },
  {
    path: '/admin',
    name: 'Admin',
    description: 'Other contract admin actions like changing the owner',
  },
  {
    path: '/index-songs',
    name: 'Index Songs',
    description: 'Index all songs in the Song A Day contract',
  },
]

export const AUCTION_ROUTES = [
  {
    path: '/auctions/create',
    name: 'Create Auction - Zora',
    description: 'Create auction for a newly minted song',
  },
  {
    path: '/auctions/mint-and-auction',
    name: 'Mint and Auction - Zora',
    description:
      'Gnosis Only - Mint, Create auction and start auction at the same time.',
  },
]

export const ADMIN_ROUTES = [
  {
    path: '/admin/change-owner',
    name: 'Change Owner',
    description: 'Change the owner of the contract',
  },
  {
    path: '/admin/find-owner',
    name: 'Find Owner',
    description: 'Find the owner of the song and the contract',
  },
  {
    path: '/admin/batch-mint',
    name: 'Batch Mint',
    description:
      'Mint pre determined songs before the SAD drop (One Time Action)',
  },
  {
    path: '/admin/refresh-metadata',
    name: 'Refresh Metadata',
    description: 'Refresh the metadata of all the songs on opensea',
  },
  {
    path: '/admin/repair-metadata',
    name: 'Repair Metadata',
    description: 'Repair the metadata of a song',
  },
]

export const BULK_ROUTES = [
  {
    path: '/bulk/image',
    name: 'Generate Images',
    description: 'Generate images from CSV file',
  },
  {
    path: '/bulk/metadata',
    name: 'Generate Metadata',
    description: 'Generate metadata from CSV file',
  },
]

export const CHAIN_ID = '0x1'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
// export const SONG_CONTRACT = '0x0dB2f6BfDfF090e3c8Eef8eA5686bb1589611424'
export const SONG_CONTRACT = '0x19b703f65aA7E1E775BD06c2aa0D0d08c80f1C45'

export const BATCH_IDS = [
  1502, 1513, 1845, 1952, 1983, 2509, 3025, 3515, 3591, 4140, 4406, 4410, 4415,
  4421, 4422, 4434, 4446, 4449, 4454, 4456, 4458, 4467, 4486, 4487, 4493, 4494,
  4511, 4515, 4528, 4534, 4538, 4544, 4546, 4550, 4563, 4587, 4593, 4606, 4666,
  4697,
]
export const BATCH_OWNERS = [
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
  '0x01afc8ff608bfbe4b18f53d004ea7d1023bcda3f',
]
