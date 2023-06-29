import { SONG_CONTRACT } from '@/utils/constants'
import { parseTokenURI } from '@/utils/helpers'

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
    `https://api.opensea.io/api/v1/asset/${SONG_CONTRACT}/${tokenId}`,
    {
      headers: {
        'X-API-KEY': '1acb1a9159b5431e9d58b4a08c5d4541',
      },
    }
  )
  const data = await response.json()
  if (data['success'] === 'false') {
    return null
  }

  const metadataUrl = data['token_metadata']

  const metadata = await getJson<SongMetadata>(parseTokenURI(metadataUrl))
  return getSongWithObjectId(metadata)
}
