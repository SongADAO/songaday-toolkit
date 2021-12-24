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
  {
    path: '/admin/batch-mint',
    name: 'Batch Mint',
    description:
      'Mint pre determined songs before the SAD drop (One Time Action)',
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
export const SONG_CONTRACT = '0x0bc24Ca2B86222aA54a08A0AECDeF5275c3f4186'

export const BATCH_IDS = [
  1502, 1513, 1845, 1952, 1983, 2509, 3025, 3515, 3591, 4140, 4406, 4410, 4415,
  4421, 4422, 4434, 4446, 4449, 4454, 4456, 4458, 4467, 4486, 4487, 4493, 4494,
  4511, 4515, 4528, 4534, 4538, 4544, 4546, 4550, 4563, 4587, 4593, 4606, 4666,
  4697,
]
export const BATCH_OWNERS = [
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
  '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
]
