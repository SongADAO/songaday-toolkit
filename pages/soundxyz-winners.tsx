import { AppLayout } from '@/components/AppLayout'
import { songabi } from '@/utils/abi/songabi'
import { SONG_CONTRACT, TREASURY_CONTRACT } from '@/utils/constants'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Checkbox,
  Tag,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { writeContract, waitForTransaction } from '@wagmi/core'
import {
  useAccount,
  useNetwork,
  type PublicClient,
  usePublicClient,
} from 'wagmi'
import fetchGraphSoundxyz from '../utils/fetchGraphSoundxyz'
import { ethers } from 'ethers'
import { DateTime } from 'luxon'
import { readContract } from '@wagmi/core'

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

  const mainnetPublicClient = usePublicClient({ chainId: 1 })

  const optimismPublicClient = usePublicClient({ chainId: 10 })

  const arbitrumPublicClient = usePublicClient({ chainId: 42161 })

  const { isConnected } = useAccount()

  const { chain } = useNetwork()

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
            id: edge.node.id,
            title: edge.node.title,
            goldenEggNft: edge.node.goldenEggNft,
            numSold: Number(edge.node.numSold),
            totalRaised: BigInt(Number(edge.node.totalRaised)),
            endsAt: Number(edge.node.finalSaleScheduleEndTimestamp),
            endsAtDate: new Date(
              Number(edge.node.finalSaleScheduleEndTimestamp)
            ).toLocaleString(),
            completed: now > Number(edge.node.finalSaleScheduleEndTimestamp),
            tokenOwner: null,
            distributed: null,
            isDistributing: false,
            willDistribute: false,
          }
        })

      // console.log(soundxyzBidsSet);

      soundxyzBids = soundxyzBids.concat(soundxyzBidsSet)
    } while (hasNextPage)

    // console.log(soundxyzBids)

    return soundxyzBids
  }

  async function lookupTokenHolders(winners) {
    const sadContract = {
      chainId: 1,
      abi: songabi,
      address: SONG_CONTRACT,
    } as const

    const contracts = winners.map((winner) => {
      return {
        ...sadContract,
        functionName: 'ownerOf',
        args: [BigInt(winner.tokenId)],
      }
    })

    const ownerOfResults = await mainnetPublicClient.multicall({
      contracts: contracts,
    })

    for (const i in winners) {
      if (ownerOfResults[i].status !== 'success') {
        throw new Error('could not determine token holder')
      }

      winners[i].tokenOwner = ownerOfResults[i].result

      if (
        winners[i].tokenOwner.toLowerCase() !== TREASURY_CONTRACT.toLowerCase()
      ) {
        winners[i].distributed = true
      } else {
        winners[i].distributed = false
      }
    }

    return winners
  }

  async function initWinners() {
    try {
      setWinners(await lookupTokenHolders(await fetchSongFromSubgraph()))
    } catch (error) {
      console.log({ error })
      toast.error((error as any).message)
    }
  }

  function toggleChecked(tokenId) {
    setWinners(
      winners.map((winner) => {
        if (winner.tokenId === tokenId) {
          winner.willDistribute = !winner.willDistribute
        }

        return winner
      })
    )
  }

  async function distribute(tokenId) {
    setWinners(
      winners.map((winner) => {
        if (winner.tokenId === tokenId) {
          winner.isDistributing = true
        }

        return winner
      })
    )

    try {
      const toDistribute = winners.find((winner) => {
        return winner.tokenId === tokenId
      })
      // console.log(toDistribute)

      const winnerAddress = toDistribute.goldenEggNft.owner.publicAddress

      const isAddressAContractMainnet = await isContract(
        winnerAddress,
        mainnetPublicClient
      )

      if (isAddressAContractMainnet) {
        throw new Error(
          'Address is a contract on mainnet. Unverified transfer is unsafe'
        )
      }

      const isAddressAContractOptimism = await isContract(
        winnerAddress,
        optimismPublicClient
      )

      if (isAddressAContractOptimism) {
        throw new Error(
          'Address is a contract on optimism. Unverified transfer is unsafe'
        )
      }

      const isAddressAContractArbitrum = await isContract(
        winnerAddress,
        arbitrumPublicClient
      )

      if (isAddressAContractArbitrum) {
        throw new Error(
          'Address is a contract on arbitrum. Unverified transfer is unsafe'
        )
      }

      console.log(toDistribute)
      console.log(TREASURY_CONTRACT)
      console.log(winnerAddress)
      console.log(BigInt(toDistribute.tokenId))

      const { hash } = await writeContract({
        chainId: 1,
        address: SONG_CONTRACT,
        abi: songabi,
        functionName: 'safeTransferFrom',
        args: [TREASURY_CONTRACT, winnerAddress, BigInt(toDistribute.tokenId)],
      })

      toast.success('Waiting for tx to confirm')
      await waitForTransaction({ hash })
      toast.success('Song Transferred')

      initWinners()
    } catch (error) {
      console.log({ error })
      toast.error((error as any).message)
    } finally {
      setWinners(
        winners.map((winner) => {
          if (winner.tokenId === tokenId) {
            winner.isDistributing = false
          }

          return winner
        })
      )
    }
  }

  async function isContract(address, publicClient) {
    // address = SONG_CONTRACT // DEBUG

    const bytecode = await publicClient.getBytecode({
      address,
    })

    return bytecode ? true : false
  }

  useEffect(() => {
    initWinners()
  }, [])

  return (
    <Stack spacing="6">
      {isConnected && (
        <Stack>
          <Heading>Sound.xyz 1/1 Winners</Heading>
          <Table w="100%" size="sm" border="1px solid rgb(74, 85, 104)">
            <Thead>
              <Tr>
                <Th>Song</Th>
                <Th>Winner</Th>
                {/* <Th>Holder</Th> */}
                <Th>Distribute</Th>
              </Tr>
            </Thead>

            {winners.map((winner, i) => (
              <Tbody key={`${winner.id}`}>
                <Tr key={`${winner.id}-title`}>
                  <Td colSpan={3} border="0" paddingBottom="0">
                    <Text mb="2" fontSize="12px" fontWeight="700">
                      {winner.title}
                    </Text>
                  </Td>
                </Tr>
                <Tr key={`${winner.id}-data`}>
                  <Td paddingTop="0" verticalAlign="bottom">
                    <Text fontSize="12px">Song: {winner.tokenId}</Text>

                    <Text fontSize="12px">Sold: {winner.numSold}</Text>
                    <Text fontSize="12px">
                      Raised: {ethers.utils.formatEther(winner.totalRaised)} Ξ
                    </Text>

                    <Text fontSize="12px">Ends: {winner.endsAtDate}</Text>

                    <Text
                      display="flex"
                      alignItems="center"
                      fontSize="12px"
                      mt={2}
                    >
                      Sale Complete:{' '}
                      {(winner.completed && (
                        <Tag
                          fontWeight="700"
                          variant="solid"
                          colorScheme="green"
                          ml={2}
                        >
                          Yes
                        </Tag>
                      )) || (
                        <Tag
                          fontWeight="700"
                          variant="solid"
                          colorScheme="red"
                          ml={2}
                        >
                          No
                        </Tag>
                      )}
                    </Text>

                    <Text
                      display="flex"
                      alignItems="center"
                      fontSize="12px"
                      mt={2}
                    >
                      1/1 Distributed:{' '}
                      {(winner.distributed && (
                        <Tag
                          fontWeight="700"
                          variant="solid"
                          colorScheme="green"
                          ml={1}
                        >
                          Yes
                        </Tag>
                      )) || (
                        <Tag
                          fontWeight="700"
                          variant="solid"
                          colorScheme="red"
                          ml={1}
                        >
                          No
                        </Tag>
                      )}
                    </Text>
                  </Td>

                  <Td paddingTop="0" verticalAlign="bottom">
                    <Text fontSize="12px">
                      {winner?.goldenEggNft?.owner?.ens ?? ''}&nbsp;
                    </Text>
                    <Text fontSize="12px">
                      {winner?.goldenEggNft?.owner?.publicAddress}
                    </Text>
                  </Td>

                  <Td paddingTop="0" verticalAlign="bottom">
                    {winner.completed &&
                      winner.tokenOwner &&
                      !winner.distributed &&
                      chain?.id === 1 && (
                        <Button
                          type="button"
                          isLoading={winner.isDistributing}
                          onClick={() => distribute(winner.tokenId)}
                        >
                          Distribute
                        </Button>
                      )}

                    {/* {winner.completed &&
                      winner.tokenOwner &&
                      !winner.distributed && (
                        <Checkbox
                          colorScheme="green"
                          isChecked={winner.willDistribute === true}
                          onChange={(e) => toggleChecked(winner.tokenId)}
                        >
                          Distribute
                        </Checkbox>
                      )} */}
                  </Td>
                </Tr>
              </Tbody>
            ))}
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
