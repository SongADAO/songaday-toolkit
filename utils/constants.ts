export const ROUTES = [
  {
    path: '/image/create',
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
    path: '/image/bulk',
    name: 'Bulk Images',
    description: 'Generate images in bulk by uploading a big JSON',
  },
]

export const AUCTION_ROUTES = [
  {
    path: '/auctions/create',
    name: 'Create Auction',
    description: 'Create auction for a newly minted song',
  },
]

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const SONG_CONTRACT = '0x0B0c157A275B749D8DF3154bf45B1702927e6CBc'
