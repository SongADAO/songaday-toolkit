import { AppLayout } from '@/components/AppLayout'
import { songabi } from '@/utils/abi/songabi'
import { SONG_CONTRACT } from '@/utils/constants'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { writeContract, waitForTransaction } from '@wagmi/core'
import { useAccount } from 'wagmi'
import fetchGraphSoundxyz from '../utils/fetchGraphSoundxyz'
import { ethers } from 'ethers'
import { DateTime } from 'luxon'

const LATEST_SOUNDXYZ_EDITIONS = `
query ArtistHighestRelease($filter: ArtistReleasesFilter, $after: String) {
    artist(id: "10f2593f-49ce-40d4-9abe-6eaab4ac1025") {
        id
        releases(
            pagination: {first: 50, sort: DESC, after: $after},
            filter: $filter,
        ) {
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
            edges {
                cursor
                node {
                    id
                    title
                    numSold
                    totalRaised
                    finalSaleScheduleEndTimestamp
                    goldenEggNft {
                        contractAddress
                        tokenId
                        isGoldenEgg
                        createdAt
                        owner {
                            publicAddress
                            ens
                        }
                    }
                }
            }
        }
    }
}
`

const SoundxyzWinners = () => {
  const now = new Date().getTime()

  const { isConnected } = useAccount()

  const [winners, setWinners] = useState<any>([])

  async function fetchSongFromSubgraph() {
    let hasNextPage = true
    let nextCursor = ''
    // let nextCursor = 'MTcwMjU4MzcwMDAwMHxmM2ZkNTk0YS02ODhhLTQ1OTUtOWUyZC02MTE5M2Q3MzIyNGE=';
    let soundxyzBids = []

    // http://0.0.0.0:3000/
    do {
      const { data: soundxyzData } = await fetchGraphSoundxyz<any, {}>(
        1,
        LATEST_SOUNDXYZ_EDITIONS,
        {
          after: nextCursor,
        }
      )

      hasNextPage = soundxyzData.artist.releases.pageInfo.hasNextPage
      nextCursor = soundxyzData.artist.releases.pageInfo.endCursor

      // console.log(hasNextPage);
      // console.log(nextCursor);
      // console.log(soundxyzData);

      const soundxyzBidsSet = await soundxyzData.artist.releases.edges
        .filter((edge) => {
          const latestEditionTitleParts = edge.node.title.trim().split('#')
          const latestEditionSongNbr = Number(
            latestEditionTitleParts[latestEditionTitleParts.length - 1]
          )

          return !isNaN(latestEditionSongNbr)
        })
        .map((edge) => {
          const latestEditionTitleParts = edge.node.title.trim().split('#')
          const latestEditionSongNbr =
            latestEditionTitleParts[latestEditionTitleParts.length - 1]

          return {
            tokenId: latestEditionSongNbr,
            goldenEggNft: edge.node.goldenEggNft,
            numSold: Number(edge.node.numSold),
            totalRaised: BigInt(Number(edge.node.totalRaised)),
            endsAt: Number(edge.node.finalSaleScheduleEndTimestamp),
            endsAtDate: new Date(
              Number(edge.node.finalSaleScheduleEndTimestamp)
            ).toLocaleString(DateTime.DATE_MED),
            metadata: {
              name: '...',
            },
          }
        })

      // console.log(soundxyzBidsSet);

      soundxyzBids = soundxyzBids.concat(soundxyzBidsSet)
    } while (hasNextPage)

    console.log(soundxyzBids)

    return soundxyzBids
  }

  async function initWinners() {
    try {
      const winners = await fetchSongFromSubgraph()
      setWinners(winners)
    } catch (e) {
      console.log('song chart subgraph fetch error', e)
    }
  }

  useEffect(() => {
    console.log('init winners')
    initWinners()
  }, [])

  return (
    <Stack spacing="6">
      {isConnected && (
        <Stack>
          <Heading>Sound.xyz Winners</Heading>
          <Table w="100%" size="sm">
            <Thead>
              <Tr>
                <Th>Song</Th>
                <Th>Ends At</Th>
                <Th>Complete</Th>
                <Th>Sold</Th>
                <Th>Raised</Th>
                <Th>Winner Address</Th>
                <Th>Winner ENS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {winners.map((winner, i) => (
                <Tr key={winner.id}>
                  <Td>{winner.tokenId}</Td>
                  <Td>{winner.endsAtDate}</Td>
                  <Td>{now > winner.endsAt ? 'Yes' : 'No'}</Td>
                  <Td>{winner.numSold}</Td>
                  <Td>{ethers.utils.formatEther(winner.totalRaised)}</Td>
                  <Td>{winner?.goldenEggNft?.owner?.publicAddress}</Td>
                  <Td>{winner?.goldenEggNft?.owner?.ens}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Stack>
      )}
      {!isConnected && (
        <Text>
          You need to be connected to the DAO's Wallet to view winners. Use the
          Connect Wallet Button to connect
        </Text>
      )}
    </Stack>
  )
}

SoundxyzWinners.Layout = AppLayout
export default SoundxyzWinners
