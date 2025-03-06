import { AppLayout } from '@/components/AppLayout'
import { songabi } from '@/utils/abi/songabi'
import { gbml2abi } from '@/utils/abi/gbml2abi'
import { zoraeditionabi } from '@/utils/abi/zoraeditionabi'
import {
  SONG_CONTRACT,
  TREASURY_CONTRACT,
  GBM_L2_ZORA_CONTRACT_ADDRESS,
  GBM_L2_ZORA_CHAIN,
  GBM_L2_ZORA_IOU_CONTRACT_ADDRESS,
  INFURA_ID,
  ZERO_ADDRESS,
  GBM_L2_ZORA_EDITION_CONTRACT_ADDRESS,
} from '@/utils/constants'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Box,
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
  Checkbox,
  Tag,
} from '@chakra-ui/react'
import { JsonRpcProvider } from '@ethersproject/providers'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, usePublicClient, useSwitchChain } from 'wagmi'
import { type PublicClient, extractChain } from 'viem'
import { Contract, ethers } from 'ethers'
import { DateTime } from 'luxon'
import { readContract } from '@wagmi/core'
import { encodeFunctionData } from 'viem'
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk'
import { mainnet, sepolia, zora } from 'viem/chains'
import { wagmiConfig as config, chains } from '@/utils/wagmi'

const GBML2ZoraWinners = () => {
  const batchSize = 262144 // 256kB;

  const now = new Date().getTime()

  const mainnetPublicClient = usePublicClient({ chainId: 1 })

  const optimismPublicClient = usePublicClient({ chainId: 10 })

  const arbitrumPublicClient = usePublicClient({ chainId: 42161 })

  // const basePublicClient = usePublicClient({ chainId: 8453 })

  const zoraPublicClient = usePublicClient({ chainId: 7777777 })

  // const sepoliaPublicClient = usePublicClient({ chainId: 11155111 })

  const { isConnected, chain, address } = useAccount()

  const { switchChain } = useSwitchChain()

  const [winners, setWinners] = useState<any>([])

  const [claims, setClaims] = useState<BigInt[]>([])

  const [isClaiming, setIsClaiming] = useState<boolean>(false)

  const auctionNetwork = GBM_L2_ZORA_CHAIN

  const auctionAddress = GBM_L2_ZORA_CONTRACT_ADDRESS

  const auctionPublicClient = zoraPublicClient

  const sadContract = {
    chainId: 1,
    abi: songabi,
    address: SONG_CONTRACT,
  } as const

  const gbmContract = {
    chainId: auctionNetwork,
    abi: gbml2abi,
    address: auctionAddress,
  } as const

  const opts = {
    allowedDomains: [/gnosis-safe.io/],
  }
  const appsSdk = new SafeAppsSDK(opts)

  async function isContract(address, publicClient) {
    // address = SONG_CONTRACT // DEBUG

    const bytecode = await publicClient.getBytecode({
      address,
    })

    return bytecode ? true : false
  }

  async function fetchSongFromSubgraph() {
    // const rpc = zora.rpcUrls.default.http[0]
    const rpc = 'https://rpc.zora.energy'

    const auctionProvider = new JsonRpcProvider(rpc)

    const iface = new ethers.utils.Interface(gbml2abi)

    const auctionContract = new Contract(
      auctionAddress,
      gbml2abi,
      auctionProvider
    )

    const filter: any = auctionContract.filters.Auction_Initialized()

    filter.fromBlock = 10916320
    filter.toBlock = 'latest'

    // filter.fromBlock = 0 // DEBUG
    // filter.toBlock = 'latest' // DEBUG

    const logs = await auctionProvider.getLogs(filter)
    const events = logs.map((log) => iface.parseLog(log))
    // console.log(filter)
    // console.log(logs)
    // console.log(events)

    const eventsReversed = events.toSorted((eventA, eventB) =>
      Number((eventA.args as any)._tokenID) <
      Number((eventB.args as any)._tokenID)
        ? 1
        : -1
    )

    const auctions = eventsReversed.map((event) => {
      return {
        _auctionID: event.args._auctionID,
        contractAddress: event.args._contractAddress,
        tokenId: event.args._tokenID.toString(),
      }
    })
    // console.log(auctions)

    return auctions
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

    for (const i in winners) {
      if (results[i].status !== 'success') {
        // throw new Error('could not determine token holder')
        winners[i].tokenOwner = ZERO_ADDRESS
        winners[i].minted = false
        winners[i].distributed = false
        continue
      }

      winners[i].tokenOwner = results[i].result
      winners[i].minted = true

      if (
        winners[i].tokenOwner.toLowerCase() !== TREASURY_CONTRACT.toLowerCase()
      ) {
        winners[i].distributed = true
      } else {
        winners[i].distributed = false
      }
    }
    // console.log(winners)

    return winners
  }

  async function lookupHighestBidder(winners) {
    const contracts = winners.map((winner) => {
      return {
        ...gbmContract,
        functionName: 'getAuctionHighestBidder',
        args: [winner._auctionID],
      }
    })

    const results = await auctionPublicClient.multicall({
      contracts: contracts,
      batchSize: batchSize,
    })

    for (const i in winners) {
      // console.log(results[i])
      if (
        results[i].status === 'success' &&
        results[i].result !== '0x0000000000000000000000000000000000000000'
      ) {
        winners[i].highestBidder = results[i].result
      } else {
        // winners[i].highestBidder = '0xf1f6Ccaa7e8f2f78E26D25b44d80517951c20284' // DEBUG
      }
    }
    // console.log(winners)

    return winners
  }

  async function lookupEndTime(winners) {
    const contracts = winners.map((winner) => {
      return {
        ...gbmContract,
        functionName: 'getAuctionEndTime',
        args: [winner._auctionID],
      }
    })

    const results = await auctionPublicClient.multicall({
      contracts: contracts,
      batchSize: batchSize,
    })

    for (const i in winners) {
      // console.log(results[i])
      if (results[i].status === 'success') {
        winners[i].endsAt = Number(results[i].result) * 1000
        winners[i].endsAtDate = new Date(winners[i].endsAt).toLocaleString()
        winners[i].completed = now > winners[i].endsAt
      }
    }
    // console.log(winners)

    return winners
  }

  async function wasClaimed(winners) {
    const contracts = winners.map((winner) => {
      return {
        ...gbmContract,
        functionName: 'wasClaimed',
        args: [winner._auctionID],
      }
    })

    const results = await auctionPublicClient.multicall({
      contracts: contracts,
      batchSize: batchSize,
    })

    for (const i in winners) {
      // console.log(results[i])
      if (results[i].status === 'success') {
        winners[i].claimed = results[i].result
      }
    }
    // console.log(winners)

    return winners
  }

  async function initWinners() {
    try {
      setWinners(
        await wasClaimed(
          await lookupEndTime(
            await lookupHighestBidder(
              await lookupTokenHolders(await fetchSongFromSubgraph())
            )
          )
        )
      )
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
          .map((claim) => claim._auctionID)
      )
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

      const winnerAddress = toDistribute.highestBidder

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

      // const isAddressAContractBase = await isContract(
      //   winnerAddress,
      //   basePublicClient
      // )

      // if (isAddressAContractBase) {
      //   throw new Error(
      //     'Address is a contract on Base. Unverified transfer is unsafe'
      //   )
      // }

      // const isAddressAContractZora = await isContract(
      //   winnerAddress,
      //   zoraPublicClient
      // )

      // if (isAddressAContractZora) {
      //   throw new Error(
      //     'Address is a contract on Zora. Unverified transfer is unsafe'
      //   )
      // }

      // console.log(toDistribute)
      // console.log(TREASURY_CONTRACT)
      // console.log(winnerAddress)
      // console.log(BigInt(toDistribute.tokenId))

      if (toDistribute.minted) {
        const hash = await writeContract(config, {
          chain: extractChain({
            chains: chains,
            id: 1,
          }),
          account: address,
          chainId: 1,
          address: SONG_CONTRACT,
          abi: songabi,
          functionName: 'safeTransferFrom',
          args: [
            TREASURY_CONTRACT,
            winnerAddress,
            BigInt(toDistribute.tokenId),
          ],
        })
        toast.success('Waiting for tx to confirm')
        await waitForTransactionReceipt(config, {
          hash,
          chainId: 1,
          confirmations: 1,
        })
      } else {
        const editionTokenId = await readContract(config, {
          chainId: auctionNetwork,
          address: auctionAddress,
          abi: gbml2abi,
          functionName: 'getEditionTokenId',
          args: [toDistribute._auctionID],
        })
        // console.log('Edition Token ID')
        // console.log(editionTokenId)

        // if (!editionTokenId) {
        //   throw new Error('Could not determine Zora edition id')
        // }

        const editionURI = await readContract(config, {
          chainId: zora.id,
          address: GBM_L2_ZORA_EDITION_CONTRACT_ADDRESS,
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
          throw new Error('Could not determine Zora edition URI')
        }

        const ipfsHash = editionURI.replace('ipfs://', '')
        // console.log('Edition IPFS Hash')
        // console.log(ipfsHash)

        const transactions = [
          {
            to: SONG_CONTRACT ?? '',
            value: '0',
            data: encodeFunctionData({
              abi: songabi,
              functionName: 'dailyMint',
              args: [toDistribute.tokenId, ipfsHash],
            }),
          },
          {
            to: SONG_CONTRACT ?? '',
            value: '0',
            data: encodeFunctionData({
              abi: songabi,
              functionName: 'safeTransferFrom',
              args: [
                TREASURY_CONTRACT,
                winnerAddress,
                BigInt(toDistribute.tokenId),
              ],
            }),
          },
        ]

        // console.log(transactions)

        await appsSdk?.txs.send({ txs: transactions })
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

  async function claim(claims) {
    setIsClaiming(true)

    // console.log(claims)

    try {
      const hash = await writeContract(config, {
        chain: extractChain({
          chains: chains,
          id: auctionNetwork,
        }),
        account: address,
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
  }, [])

  return (
    <Stack spacing="6">
      {isConnected && (
        <Stack>
          <Heading>GBM L2 Zora Winners</Heading>

          <Box>
            {(chain?.id === zora.id && (
              <Button
                type="button"
                isLoading={isClaiming}
                onClick={() => claim(claims)}
              >
                Claim Funds
              </Button>
            )) || (
              <Button onClick={() => switchChain({ chainId: zora.id })}>
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
                                  onClick={() => distribute(winner.tokenId)}
                                >
                                  Mint & Distribute
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

GBML2ZoraWinners.Layout = AppLayout
export default GBML2ZoraWinners
