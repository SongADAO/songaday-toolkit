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
]

export const AUCTION_ROUTES = [
  {
    path: '/auctions/create',
    name: 'Create Auction',
    description: 'Create auction for a newly minted song',
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

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const SONG_CONTRACT = '0x0B0c157A275B749D8DF3154bf45B1702927e6CBc'
