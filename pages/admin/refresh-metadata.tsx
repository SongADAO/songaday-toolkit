import { AppLayout } from '@/components/AppLayout'
import { SONG_CONTRACT } from '@/utils/constants'
import {
  Button,
  Heading,
  Stack,
  Text,
  Wrap,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { orderBy } from 'lodash'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const getAllUnrefreshedSongs = async (
  acc: number[],
  page: number
): Promise<number[]> => {
  const url = `https://api.opensea.io/assets?${new URLSearchParams({
    asset_contract_address: SONG_CONTRACT,
    limit: '50',
    offset: (page * 50).toString(),
  })}`

  const data = await fetch(
    `/api/opensea-api-proxy?url=${encodeURIComponent(url)}`
  )

  const response = await data.json()

  if (!response.success) {
    return []
  }

  const assets = [
    ...acc,
    ...response.assets
      .filter(
        (asset: any) =>
          !asset.image_original_url || !asset.animation_original_url
      )
      .map((asset: any) => Number(asset.token_id)),
  ]

  if (response.assets.length === 50) {
    return getAllUnrefreshedSongs(assets, page + 1)
  }

  return orderBy(assets)
}

const RefreshMetadata = () => {
  const [tokens, setTokens] = useState<number[]>([])

  const [loading, setLoading] = useState(false)

  const refreshMetadata = async () => {
    setLoading(true)

    // RUN ASYNC FOR LOOP

    for await (const token of tokens) {
      toast.success('Refreshing metadata for token: ' + token)
      try {
        const url = `https://api.opensea.io/api/v1/asset/${SONG_CONTRACT}/${token.toString()}?force_update=true`
        await fetch(`/api/opensea-api-proxy?url=${encodeURIComponent(url)}`)
      } catch (error) {
        console.log(error)
        toast.error((error as any).message)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    getAllUnrefreshedSongs([], 0).then((tokens) => setTokens(tokens))
  }, [])

  return (
    <Stack spacing="6">
      <Stack>
        <Heading>Refresh Metadata</Heading>
        <Text>
          If opensea is unable to display the metadata of the songs correctly,
          use the refresh button to refresh all of them at once.
        </Text>
        <Text>
          The list only shows the songs where the animation_url or image_url was
          not found in the opensea's indexed metadata
        </Text>

        <Stack spacing="6">
          <Wrap>
            <Button
              loadingText="Refreshing"
              isLoading={loading}
              disabled={loading}
              onClick={() => refreshMetadata()}
            >
              Refresh
            </Button>
          </Wrap>
          <Wrap>
            <Table w="50%" size="sm">
              <Thead>
                <Tr>
                  <Th>Song #</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tokens.map((id) => (
                  <Tr key={id}>
                    <Td>{id}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Wrap>
        </Stack>
      </Stack>
    </Stack>
  )
}

RefreshMetadata.Layout = AppLayout
export default RefreshMetadata
