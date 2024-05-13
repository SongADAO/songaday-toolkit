import { SONG_CONTRACT } from '@/utils/constants'
import { parseTokenURI } from '@/utils/helpers'
import { promises as fs } from 'fs'

export interface SongMetadata {
  name: string
  created_by: string
  description: string
  external_url: string
  token_id: string | number
  image: string
  animation_url: string
  youtube_url: string
  attributes: {
    trait_type: string
    value: string
  }[]
}
export const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)
  return await response.json()
}

export const getSongWithObjectId = (song: SongMetadata) => {
  const flattened: Record<string, unknown | unknown[]> = {}
  song.attributes.forEach((attr) => {
    if (attr.trait_type === 'Instrument' || attr.trait_type === 'Style') {
      if (!flattened[attr.trait_type]) flattened[attr.trait_type] = [attr.value]
      else {
        flattened[attr.trait_type] = [
          // @ts-ignore
          ...flattened[attr.trait_type],
          attr.value,
        ]
      }
    } else {
      flattened[attr.trait_type] = attr.value
    }
  })

  return {
    ...song,
    ...flattened,
    objectID: song.token_id,
  }
}

export const getSongFromOpenSea = async (tokenId: string) => {
  const response = await fetch(
    `https://api.opensea.io/api/v2/chain/ethereum/contract/${SONG_CONTRACT}/nfts/${tokenId}`,
    {
      headers: {
        'X-API-KEY': 'a3eb4c06baa14b9cb4ab5a161f166d72',
      },
    }
  )

  const data = await response.json()

  if (typeof data['nft'] === 'undefined') {
    console.log(data)

    return null
  }

  const metadata = data['nft']
  metadata.identifier = Number(metadata.identifier)
  metadata.attributes = metadata.traits
  metadata.token_id = metadata.identifier
  metadata.image = metadata.image_url

  // const metadataUrl = data['nft']['metadata_url']
  // console.log(metadataUrl)

  // // const usableTokenURI =
  // //   parseTokenURI(metadataUrl).replace('https://ipfs.io/ipfs/', 'https://') +
  // //   '.ipfs.nftstorage.link/'

  // const usableTokenURI = parseTokenURI(metadataUrl).replace(
  //   'https://ipfs.io/ipfs/',
  //   'https://gateway.pinata.cloud/ipfs/'
  // )

  // console.log(usableTokenURI)

  // const metadata = await getJson<SongMetadata>(usableTokenURI)

  return getSongWithObjectId(metadata)
}

export const getSongFromAllMetadata = async (tokenId: string) => {
  const metadataPath = `/all-metadata/${tokenId}.json`

  const metadataStr = await fs.readFile(process.cwd() + metadataPath, 'utf8')

  const metadata = JSON.parse(metadataStr)

  return getSongWithObjectId(metadata)
}

export const getSongFromOutputMetadata = async (tokenId: string) => {
  const metadataPath = `/output/${tokenId}/metadata.json`

  const metadataStr = await fs.readFile(process.cwd() + metadataPath, 'utf8')

  const metadata = JSON.parse(metadataStr)

  return getSongWithObjectId(metadata)
}
