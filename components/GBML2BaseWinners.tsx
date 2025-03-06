import { gql, useQuery } from '@apollo/client'
import { AppLayout } from '@/components/AppLayout'
import { songabi } from '@/utils/abi/songabi'
import { gbml2abi } from '@/utils/abi/gbml2abi'
import { zoraeditionabi } from '@/utils/abi/zoraeditionabi'
import {
  SONG_CONTRACT,
  TREASURY_CONTRACT,
  SONGADAY_MINTER,
  GBM_L2_BASE_CONTRACT_ADDRESS,
  GBM_L2_BASE_CHAIN,
  ZERO_ADDRESS,
  GBM_L2_BASE_EDITION_CONTRACT_ADDRESS,
} from '@/utils/constants'
import {
  Button,
  Box,
  Heading,
  Stack,
  Text,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tag,
} from '@chakra-ui/react'
import { wagmiConfig as config } from '@/utils/wagmi'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, usePublicClient, useSwitchChain } from 'wagmi'
import { getAddress } from 'viem'
import { readContract } from '@wagmi/core'
import { mainnet } from 'viem/chains'
import { base } from 'utils/base-chain'

// Auction Query
// ===========================================================================

interface Auction {
  // bidDecimals: string;
  // bidMultiplier: string;
  claimAt: string
  claimed: boolean
  editionContractAddress: `0x${string}`
  editionTokenId: number
  endsAt: string
  // gbmFees: string;
  highestBid: string
  highestBidder: `0x${string}`
  id: string
  // incMax: string;
  // incMin: string;
  lastBidTime: string
  lastBidTxHash: string
  // platformFees: string;
  startsAt: string
  // stepMin: string;
  tokenId: string
}

interface AuctionsResult {
  auctions: Auction[]
}

interface AuctionsQueryVars {
  timestamp: number
}

const AUCTIONS_QUERY = gql`
  query GetAuctions($timestamp: Int) {
    auctions(first: 100, orderBy: tokenId, orderDirection: desc) {
      # bidDecimals
      # bidMultiplier
      claimAt
      claimed
      # contractAddress
      editionContractAddress
      editionTokenId
      endsAt
      # endsAtOriginal
      # firstBid
      # firstBidder
      # gbmFees
      # hammerTimeDuration
      highestBid
      highestBidder
      id
      # incMax
      # incMin
      lastBidTime
      lastBidTxHash
      # platformFees
      # presetId
      # quantity
      startsAt
      # stepMin
      tokenId
      # type
    }
  }
`

const GBML2BaseWinners = () => {
  const [timestamp, setTimestamp] = useState<number | null>(null)

  useEffect(() => {
    setTimestamp(Math.floor(Date.now() / 1000))
  }, [])

  const {
    loading: auctionsLoading,
    error: auctionsError,
    data: auctions,
  } = useQuery<AuctionsResult, AuctionsQueryVars>(AUCTIONS_QUERY, {
    // Optional: Fetch policy
    fetchPolicy: 'network-only',
    // Optional: Polling interval in milliseconds
    pollInterval: 0,
    // Optional: Skip the query if not looking for latest auction.
    skip: !timestamp,
    variables: {
      timestamp: Number(timestamp),
    },
  })

  const batchSize = 262144 // 256kB;

  const now = new Date().getTime()

  const mainnetPublicClient = usePublicClient({ chainId: 1 })

  const optimismPublicClient = usePublicClient({ chainId: 10 })

  const arbitrumPublicClient = usePublicClient({ chainId: 42161 })

  const basePublicClient = usePublicClient({ chainId: 8453 })

  const zoraPublicClient = usePublicClient({ chainId: 7777777 })

  // const sepoliaPublicClient = usePublicClient({ chainId: 11155111 })

  const { isConnected, chain } = useAccount()

  const { switchChain } = useSwitchChain()

  const [winners, setWinners] = useState<any>([])

  const [claims, setClaims] = useState<BigInt[]>([])

  const [isClaiming, setIsClaiming] = useState<boolean>(false)

  const auctionNetwork = GBM_L2_BASE_CHAIN

  const auctionAddress = GBM_L2_BASE_CONTRACT_ADDRESS

  const sadContract = {
    chainId: 1,
    abi: songabi,
    address: SONG_CONTRACT,
  } as const

  async function isContract(address, publicClient) {
    // address = SONG_CONTRACT // DEBUG

    const bytecode = await publicClient.getBytecode({
      address,
    })

    return bytecode ? true : false
  }

  async function lookupTokenHolders(winners) {
    const contracts = winners.map((winner) => {
      return {
        ...sadContract,
        functionName: 'ownerOf',
        args: [BigInt(winner.tokenId)],
      }
    })

    const results = await mainnetPublicClient.multicall({
      contracts: contracts,
      batchSize: batchSize,
    })

    return winners.map((winner, i) => {
      if (results[i].status === 'success') {
        winner.tokenOwner = results[i].result
        winner.minted = true
        winner.distributed =
          winner.tokenOwner.toLowerCase() !== TREASURY_CONTRACT.toLowerCase() &&
          winner.tokenOwner.toLowerCase() !== SONGADAY_MINTER.toLowerCase()
      } else {
        winner.tokenOwner = ZERO_ADDRESS
        winner.minted = false
        winner.distributed = false
      }

      return winner
    })
  }

  async function lookupEndTime(winners) {
    return winners.map((winner) => {
      winner.endsAt = Number(winner.endsAt) * 1000
      winner.endsAtDate = new Date(winner.endsAt).toLocaleString()
      winner.completed = now > winner.endsAt

      return winner
    })
  }

  async function initWinners() {
    try {
      if (auctions?.auctions) {
        setWinners(
          await lookupEndTime(
            await lookupTokenHolders(
              JSON.parse(JSON.stringify(auctions.auctions))
            )
          )
        )
      }
    } catch (error) {
      // console.log({ error })
      toast.error((error as any).message)
    }
  }

  function initClaims() {
    try {
      setClaims(
        winners
          .filter((winner) => winner.completed && !winner.claimed)
          .map((claim) => claim.id)
      )
    } catch (error) {
      console.log({ error })
      toast.error((error as any).message)
    }
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

      const winnerAddress = toDistribute.highestBidder

      const realHighestBidder = await readContract(config, {
        chainId: auctionNetwork,
        address: auctionAddress,
        abi: gbml2abi,
        functionName: 'getAuctionHighestBidder',
        args: [toDistribute.id],
      })

      if (getAddress(realHighestBidder) !== getAddress(winnerAddress)) {
        throw new Error(
          'Highest bidder in the contract does not match the value in the subgraph.  Wait a few minutes for subgraph to sync.'
        )
      }

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

      const isAddressAContractBase = await isContract(
        winnerAddress,
        basePublicClient
      )

      if (isAddressAContractBase) {
        throw new Error(
          'Address is a contract on Base. Unverified transfer is unsafe'
        )
      }

      const isAddressAContractZora = await isContract(
        winnerAddress,
        zoraPublicClient
      )

      if (isAddressAContractZora) {
        throw new Error(
          'Address is a contract on Zora. Unverified transfer is unsafe'
        )
      }

      // console.log(toDistribute)
      // console.log(TREASURY_CONTRACT)
      // console.log(winnerAddress)
      // console.log(BigInt(toDistribute.tokenId))

      if (toDistribute.minted) {
        const hash = await writeContract(config, {
          chainId: 1,
          address: SONG_CONTRACT,
          abi: songabi,
          functionName: 'safeTransferFrom',
          args: [SONGADAY_MINTER, winnerAddress, BigInt(toDistribute.tokenId)],
        })
        toast.success('Waiting for tx to confirm')
        await waitForTransactionReceipt(config, {
          hash,
          chainId: 1,
          confirmations: 1,
        })
      }

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

  async function mint(tokenId) {
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

      if (!toDistribute.minted) {
        const editionTokenId = await readContract(config, {
          chainId: auctionNetwork,
          address: auctionAddress,
          abi: gbml2abi,
          functionName: 'getEditionTokenId',
          args: [toDistribute.id],
        })
        // console.log('Edition Token ID')
        // console.log(editionTokenId)

        // if (!editionTokenId) {
        //   throw new Error('Could not determine base edition id')
        // }

        const editionURI = await readContract(config, {
          chainId: base.id,
          address: GBM_L2_BASE_EDITION_CONTRACT_ADDRESS,
          abi: zoraeditionabi,
          functionName: 'uri',
          args: [editionTokenId],
        })
        // console.log('Edition URI')
        // console.log(editionURI)

        if (
          !editionURI ||
          editionURI ===
            'ipfs://bafkreidjyzontu7nocz6gbxzldocdnvr52cabwj5l334i4aqgckt4xpa6a'
        ) {
          throw new Error('Could not determine Base edition URI')
        }

        const ipfsHash = editionURI.replace('ipfs://', '')
        // console.log('Edition IPFS Hash')
        // console.log(ipfsHash)

        const hash = await writeContract(config, {
          chainId: 1,
          address: SONG_CONTRACT,
          abi: songabi,
          functionName: 'dailyMint',
          args: [toDistribute.tokenId, ipfsHash],
        })
        toast.success('Waiting for tx to confirm')
        await waitForTransactionReceipt(config, {
          hash,
          chainId: 1,
          confirmations: 1,
        })
      }

      toast.success('Song Minted')

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

  async function claim(claims) {
    setIsClaiming(true)

    // console.log(claims)

    try {
      const hash = await writeContract(config, {
        chainId: auctionNetwork,
        address: auctionAddress,
        abi: gbml2abi,
        functionName: 'claimMultiple',
        args: [claims],
      })

      toast.success('Waiting for tx to confirm')
      await waitForTransactionReceipt(config, {
        hash,
        chainId: auctionNetwork,
        confirmations: 1,
      })
      toast.success('Song Transferred')

      initClaims()
    } catch (error) {
      console.log({ error })
      toast.error((error as any).message)
    } finally {
      setIsClaiming(false)
    }
  }

  useEffect(() => {
    initClaims()
  }, [winners])

  useEffect(() => {
    initWinners()
  }, [auctions])

  return (
    <Stack spacing="6">
      {isConnected && (
        <Stack>
          <Heading>GBM L2 Base Winners</Heading>

          <Box>
            {(chain?.id === base.id && (
              <Button
                type="button"
                isLoading={isClaiming}
                onClick={() => claim(claims)}
              >
                Claim Funds
              </Button>
            )) || (
              <Button onClick={() => switchChain({ chainId: base.id })}>
                Switch Chain
              </Button>
            )}
          </Box>

          <Table w="100%" size="sm" border="1px solid rgb(74, 85, 104)">
            <Thead>
              <Tr>
                <Th>Song</Th>
                <Th>High Bidder</Th>
                <Th>Distribute</Th>
              </Tr>
            </Thead>

            {winners.map((winner, i) => (
              <Tbody key={`${winner.tokenId}`}>
                <Tr key={`${winner.tokenId}-title`}>
                  <Td colSpan={3} border="0" paddingBottom="0">
                    <Text mb="2" fontSize="12px" fontWeight="700">
                      {winner.tokenId}
                    </Text>
                  </Td>
                </Tr>
                <Tr key={`${winner.tokenId}-data`}>
                  <Td paddingTop="0" verticalAlign="bottom">
                    <Text fontSize="12px">Song: {winner.tokenId}</Text>

                    <Text fontSize="12px" mt={2}>
                      Ends At: {winner?.endsAtDate}
                    </Text>

                    <Text
                      display="flex"
                      alignItems="center"
                      fontSize="12px"
                      mt={2}
                    >
                      Auction Complete:{' '}
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
                      Funds Claimed:{' '}
                      {(winner.claimed && (
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

                    <Text
                      display="flex"
                      alignItems="center"
                      fontSize="12px"
                      mt={2}
                    >
                      1/1 Minted:{' '}
                      {(winner.minted && (
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
                      Distributed:{' '}
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
                    <Text fontSize="12px">{winner?.highestBidder}</Text>
                  </Td>

                  <Td paddingTop="0" verticalAlign="bottom">
                    {winner.completed &&
                      winner.highestBidder &&
                      winner.tokenOwner &&
                      !winner.distributed && (
                        <>
                          {(chain?.id === mainnet.id && (
                            <>
                              {(winner.minted && (
                                <Button
                                  type="button"
                                  isLoading={winner.isDistributing}
                                  onClick={() => distribute(winner.tokenId)}
                                >
                                  Distribute
                                </Button>
                              )) || (
                                <Button
                                  type="button"
                                  isLoading={winner.isDistributing}
                                  onClick={() => mint(winner.tokenId)}
                                >
                                  Mint
                                </Button>
                              )}
                            </>
                          )) || (
                            <Button
                              onClick={() =>
                                switchChain({ chainId: mainnet.id })
                              }
                            >
                              Switch Chain
                            </Button>
                          )}
                        </>
                      )}
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

GBML2BaseWinners.Layout = AppLayout
export default GBML2BaseWinners
