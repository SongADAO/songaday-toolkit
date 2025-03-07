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
  // {
  //   path: '/upload-edition',
  //   name: 'Upload Edition to IPFS',
  //   description: 'Upload an ERC1155-Edition to IPFS (Video, Image, Metadata)',
  // },
  {
    path: '/mint',
    name: 'Mint Song',
    description: 'Mint a new song by giving IPFS hash of the metadata',
  },
  // {
  //   path: '/mint-edition',
  //   name: 'Mint Edition',
  //   description: 'Mint a song edition by giving IPFS hash of the metadata',
  // },
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
  // {
  //   path: '/soundxyz-winners',
  //   name: 'Sound.xyz Winners',
  //   description: 'Sound.xyz Winners',
  // },
  {
    path: '/gbm-l2-base-winners',
    name: 'GBM L2 Base Winners',
    description: 'GBM L2 Base Winners',
  },
  // {
  //   path: '/gbm-l2-zora-winners',
  //   name: 'GBM L2 Zora Winners',
  //   description: 'GBM L2 Zora Winners',
  // },
]

export const AUCTION_ROUTES = [
  {
    path: '/auctions/create-gbm-l2-base',
    name: 'Create Auction - GBM L2 Base',
    description: 'Create auction for a newly minted song',
  },
  // {
  //   path: '/auctions/create-gbm-l2-zora',
  //   name: 'Create Auction - GBM L2 Zora',
  //   description: 'Create auction for a newly minted song',
  // },
  // {
  //   path: '/auctions/create-gbm',
  //   name: 'Create Auction - GBM',
  //   description: 'Create auction for a newly minted song',
  // },
  // {
  //   path: '/auctions/mint-and-auction-gbm',
  //   name: 'Mint and Auction - GBM',
  //   description:
  //     'Gnosis Only - Mint, Create auction and start auction at the same time.',
  // },
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
    path: '/admin/refresh-metadata',
    name: 'Refresh Metadata',
    description: 'Refresh the metadata of all the songs on opensea',
  },
  {
    path: '/admin/repair-metadata',
    name: 'Repair Metadata',
    description: 'Repair the metadata of a song',
  },
  {
    path: '/admin/repair-edition-metadata',
    name: 'Repair Editions Metadata',
    description: 'Repair the metadata of a song edition',
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

export const USE_TESTNET = false

export const WALLET_CONNECT_PROJECT_ID = '55df63e3faebd774218c3990b418f5cd'

export const INFURA_ID = '60a7b2c16321439a917c9e74a994f7df'
// export const INFURA_ID = '0251872b43d94c17a58a4e5f2591a84a'

export const CHAIN_ID = '0x1'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
// export const SONG_CONTRACT = '0x0dB2f6BfDfF090e3c8Eef8eA5686bb1589611424'
export const SONG_CONTRACT = '0x19b703f65aA7E1E775BD06c2aa0D0d08c80f1C45'

export const SONG_EDITION_CONTRACT =
  '0x9c17564ccaa0bae1d3883251cae70ca86ef3ec41'
export const SONG_EDITION_CHAIN_ID = 10
// export const SONG_EDITION_CHAIN_ID = '0xa4b1'
// export const SONG_EDITION_CONTRACT = '0xb43d07a87EB2591d5ae8729e07BD41085C82d497'
// export const SONG_EDITION_CHAIN_ID = '0x5'

export const SONGADAY_MINTER = '0xabA3A04FC85Fd7bBC2538E708e9E30bbc59899C3'
export const TREASURY_CONTRACT = '0x2a2C412c440Dfb0E7cae46EFF581e3E26aFd1Cd0'
export const TREASURY_CONTRACT_ARBITRUM =
  '0xEBdD4a481ef26AeA77d8d77047Bfeb21b8D6d1Bb'
export const TREASURY_CONTRACT_OPTIMISM =
  '0xd109cBAe281B67C12B93FAc119A23e0356DDbA5f'

// export const GBM_CONTRACT = '0xd736d2c76fba2ba5a217fd4edfa1b231deeeb29d'
export const GBM_CONTRACT = '0x1c51Abab1160879e697733124da80e4072590BBD'
export const GBM_INITIATOR_CONTRACT =
  '0xc3f71feebd2ac213cacb5da33b4ddb38d0f163ca'

// export const GBM_L2_ZORA_EDITION_MINTER =
//   '0x1Cd1C1f3b8B779B50Db23155F2Cb244FCcA06B21'
// export const GBM_L2_ZORA_CONTRACT_ADDRESS =
//   '0x21ca9c4D80dFBaFe71f8e438a495906BEFef0069'
// export const GBM_L2_ZORA_CHAIN = 11155111
// export const GBM_L2_ZORA_EDITION_CONTRACT_ADDRESS =
//   '0x0b9a2b4eed133fcb1061dc502078d1ad4b5d6137'
// export const GBM_L2_ZORA_IOU_CONTRACT_ADDRESS =
//   '0x000000000000000000000000000000000000dEaD'

export const GBM_L2_ZORA_EDITION_MINTER =
  '0x04E2516A2c207E84a1839755675dfd8eF6302F0a'
export const GBM_L2_ZORA_CONTRACT_ADDRESS =
  '0x2cc2D8256798b35a4c1D181284127BAaCa750014'
export const GBM_L2_ZORA_CHAIN = 7777777
export const GBM_L2_ZORA_EDITION_CONTRACT_ADDRESS =
  '0x430095df3b880cabd2891d7af0acba66d91371c4' // PROD
export const GBM_L2_ZORA_IOU_CONTRACT_ADDRESS = SONG_CONTRACT // PROD

export const GBM_L2_BASE_EDITION_MINTER =
  '0x04E2516A2c207E84a1839755675dfd8eF6302F0a'
export const GBM_L2_BASE_CONTRACT_ADDRESS =
  '0xEaedaDe6A47b08f21C6c0B319024c6fedA3E6539'
export const GBM_L2_BASE_CHAIN = 8453
export const GBM_L2_BASE_EDITION_CONTRACT_ADDRESS =
  '0xb3bad5fE12268EDC8a52Ff786076C1D1fA92eF0d' // PROD
export const GBM_L2_BASE_IOU_CONTRACT_ADDRESS = SONG_CONTRACT // PROD
export const GBM_L2_BASE_SUBGRAPH =
  'https://api.goldsky.com/api/public/project_cls54edc9ynxy01tq9ibk30n4/subgraphs/songadaygbmbase/v0.0.4/gn'

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
