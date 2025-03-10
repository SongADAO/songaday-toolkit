import { AppLayout } from '@/components/AppLayout'
import { createNew1155Token } from '@zoralabs/protocol-sdk'
import {
  GBM_L2_BASE_CONTRACT_ADDRESS,
  GBM_L2_BASE_CHAIN,
  GBM_L2_BASE_IOU_CONTRACT_ADDRESS,
  GBM_L2_BASE_EDITION_MINTER,
  GBM_L2_BASE_EDITION_CONTRACT_ADDRESS,
} from '@/utils/constants'
import fetchJson from '@/utils/fetchJson'
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
  Checkbox,
} from '@chakra-ui/react'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  useAccount,
  useSwitchChain,
  usePublicClient,
  useWalletClient,
} from 'wagmi'
import {
  writeContract,
  waitForTransactionReceipt,
  readContract,
} from '@wagmi/core'
import { gbml2abi } from '@/utils/abi/gbml2abi'
import { zoraeditionabi } from '@/utils/abi/zoraeditionabi'
import {
  createPublicClient,
  getContract,
  http,
  parseAbi,
  encodeFunctionData,
  extractChain,
  parseEther,
} from 'viem'
import { wagmiConfig as config, chains } from '@/utils/wagmi'

type SongTrait = {
  trait_type: string
  value: string
}

type Song = {
  token_id: number
  name: string
  description: string
  image: string
  animation_url: string
  external_url: string
  youtube_url: string
  attributes: SongTrait[]
}

type TokenDetail = {
  owner: `0x${string}`
  tokenId: bigint
  refundableAmount: bigint
  rewardPoints: bigint
  expiresAt: Date
}

async function getTokenHolders(contract): Promise<`0x${string}`[]> {
  const [count, cap] = await contract.read.supplyDetail()
  const promises = []
  for (let i = 1; i <= count; i++) {
    promises.push(contract.read.ownerOf([BigInt(i)]))
  }
  return Promise.all(promises)
}

async function getBulkSubscriptions(
  contract,
  tokenHolders: `0x${string}`[]
): Promise<TokenDetail[]> {
  const promises = tokenHolders.map((addr) => {
    return contract.read
      .subscriptionOf([addr])
      .then(([tokenId, refundableAmount, rewardPoints, expiresAt]) => {
        return {
          owner: addr,
          tokenId,
          refundableAmount,
          rewardPoints,
          expiresAt: new Date(Number(expiresAt) * 1000),
        }
      })
  })
  return Promise.all(promises)
}

const CreateAuctionGBML2 = () => {
  const [created, setCreated] = useState(false)
  const [hypersubSent, setHypersubSent] = useState(false)
  const [songNbr, setSongNbr] = useState<string>('')
  const [ipfsHash, setIpfsHash] = useState<string>('')
  const [zoraEditionTokenId, setZoraEditionTokenId] = useState<string>('')
  const [checked, setChecked] = useState(true)
  const [date, setDate] = useState<string>(
    `${DateTime.local()
      .plus({ day: 1, minute: 5 })
      .toFormat('yyyy-LL-dd HH:mm:00')}`
  )
  const [loading, setLoading] = useState(false)
  const [editionLoading, setEditionLoading] = useState(false)
  const [hypersubLoading, setHypersubLoading] = useState(false)
  const [solanaFormLoading, setSolanaFormLoading] = useState(false)
  const { isConnected, chain, address } = useAccount()

  const { switchChain } = useSwitchChain()

  const basePublicClient = usePublicClient({ chainId: GBM_L2_BASE_CHAIN })

  const { data: baseWalletClient } = useWalletClient({
    chainId: GBM_L2_BASE_CHAIN,
  })

  const auctionNetwork = GBM_L2_BASE_CHAIN

  const auctionAddress = GBM_L2_BASE_CONTRACT_ADDRESS

  async function getSolanaFormURL(songNbr: number) {
    const song: Song = await fetchJson(
      `/api/read-output-metadata/?token_id=${songNbr}`
    )

    if (Number(song?.token_id) !== Number(songNbr)) {
      throw new Error('could not find metadata')
    }

    const dateAttr = song.attributes.find((attr) => attr.trait_type === 'Date')
    const month = dateAttr.value.substring(5, 7)
    const day = dateAttr.value.substring(8, 10)
    const year = dateAttr.value.substring(0, 4)

    const attributes = song.attributes.map((attr) => {
      return `{"Key":"${attr.trait_type}","Value":"${attr.value}"}`
      // return { Key: attr.trait_type, Value: attr.value }
    })
    const attributesStr = '[' + attributes.join(',') + ']'

    const paramsObj = new URLSearchParams()

    paramsObj.append('creatorName', 'Jonathan Mann')
    paramsObj.append('preferredDrop[month]', month)
    paramsObj.append('preferredDrop[day]', day)
    paramsObj.append('preferredDrop[year]', year)
    paramsObj.append('email', 'jonathan@jonathanmann.net')
    paramsObj.append('name', song.name)
    // paramsObj.append('description', song.description);
    paramsObj.append(
      'rarity',
      'Common (Base piece that goes to all active subscribers)'
    )
    paramsObj.append(
      'imageLink',
      song.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
    )
    paramsObj.append(
      'animationLink',
      song.animation_url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    )
    paramsObj.append('supply', 'Open')
    paramsObj.append('additionalFile24', '')
    paramsObj.append('anyAdditional', '')
    paramsObj.append('doYou42', 'No')
    paramsObj.append('typeA15', attributesStr)
    // paramsObj.append(
    //   'anyAdditional',
    //   `external_url: ${song.external_url} youtube_url: ${song.youtube_url}`
    // )

    const searchParams = new URLSearchParams(paramsObj)

    const endpoint = 'https://form.jotform.com/240875856274368?'

    const url =
      endpoint +
      searchParams +
      '&description=' +
      encodeURIComponent(song.description)

    console.log(url)

    return url
  }

  async function openSolanaForm(songNbr: number) {
    const url = await getSolanaFormURL(songNbr)

    window.open(url)
  }

  function extractTokenIdFromReceipt(receipt) {
    // Look for the specific Zora token creation event
    // The first log often contains the token ID in the third topic
    if (receipt.logs && receipt.logs.length > 0) {
      const firstLog = receipt.logs[0]
      if (firstLog.topics && firstLog.topics.length >= 3) {
        // Token ID is in the third topic (index 2)
        const tokenIdHex = firstLog.topics[2]
        // Convert hex to decimal
        return BigInt(tokenIdHex)
      }
    }

    // Fallback: Look through all logs for any topic that might contain the token ID
    for (const log of receipt.logs) {
      // Many Zora events include the token ID as the second topic
      if (log.topics && log.topics.length >= 2) {
        // Check if this is a known Zora event (you can add more signatures as needed)
        if (
          log.topics[0] ===
            '0x5086d1bcea28999da9875111e3592688fbfa821db63214c695ca35768080c2fe' ||
          log.topics[0] ===
            '0x35fb03d0d293ef5b362761900725ce891f8f766b5a662cdd445372355448e7ca' ||
          log.topics[0] ===
            '0x6bb7ff708619ba0610cba295a58592e0451dee2622938c8755667688daf3529b' ||
          log.topics[0] ===
            '0x1b944478023872bf91b25a13fdba3a686fdb1bf4dbb872f850240fad4b8cc068' ||
          log.topics[0] ===
            '0x5837d55897cfc337f160a71d7b63a047abd50a3a8834f1c5d70f338846358c6d'
        ) {
          // The token ID might be in topic[1] or topic[2] depending on the event
          // Try topic[1] first (common in Zora events)
          const tokenIdHex = log.topics[1]
          // Convert hex to decimal and return
          return BigInt(tokenIdHex)
        }
      }
    }

    throw new Error('Could not extract token ID from transaction receipt')
  }

  const createZoraEditionHandler = async () => {
    setEditionLoading(true)
    try {
      if (!songNbr) {
        toast.error('Song number is not present')
        return
      }

      if (!ipfsHash) {
        toast.error('Song edition ipfs hash is not present')
        return
      }

      console.log(chain.id)
      console.log(GBM_L2_BASE_CHAIN)
      if (chain?.id !== GBM_L2_BASE_CHAIN) {
        toast.error('Switch to edition L2')
        return
      }

      const existingEditionTokenIdData = (await fetchJson(
        `/api/get-edition-id/?songNbr=${songNbr}`
      )) as { editionTokenId: number }

      const existingEditionTokenId = existingEditionTokenIdData?.editionTokenId
      // console.log(editionTokenId)

      if (existingEditionTokenId) {
        throw new Error('An edition already exists for this song.')
      }

      if (Number(songNbr) < 5909) {
        throw new Error(
          'The specified song number is not allowed for zora sdk mints. (wrong number entered?)'
        )
      }

      toast.success('Creating the edition')
      const duration = DateTime.fromISO(date).diff(DateTime.local())

      const length = checked
        ? 86400
        : parseInt(duration.as('seconds').toString())

      // Edition ends one day after the auction.
      const editionEndsAt = length + 86400

      const nowTimestamp = Math.floor(new Date().getTime() / 1000)

      const oneDayFromNow = nowTimestamp + 86400

      const endTimestamp = nowTimestamp + length

      const editionEndTimestamp = endTimestamp
      // const editionEndTimestamp = '18446744073709551615' // Never end

      const editionPrice = '0'
      // const editionPrice = '5000000000000000'

      const editionURI = 'ipfs://' + ipfsHash

      console.log(duration)
      console.log(oneDayFromNow)
      console.log(endTimestamp)
      console.log(editionEndTimestamp)
      console.log(editionPrice)
      console.log(editionURI)

      if (endTimestamp < oneDayFromNow) {
        throw new Error('End time must be at least 24 hours')
      }

      const { parameters } = await createNew1155Token({
        contractAddress: GBM_L2_BASE_EDITION_CONTRACT_ADDRESS,
        token: {
          tokenMetadataURI: editionURI,
          salesConfig: {
            // setting a price per token on the `salesConfig` will
            // result in the token being created with a fixed price in addition
            // to the mint fee.  In this case, creator rewards will not be earned
            // on the mint fee, the `ZoraCreatorFixedPriceSaleStrategy` is setup
            // as the minter for this token, and correspondingly the onchain
            // secondary market feature will NOT be used for tokens minted using
            // that minter.
            pricePerToken: parseEther(editionPrice),
            // Earliest time a token can be minted.  If undefined or 0, then it can be minted immediately.  Defaults to 0n.
            saleStart: BigInt('0'),
            // Market countdown, in seconds, that will start once the minimum mints for countdown is reached. Defaults to 24 hours.
            marketCountdown: BigInt(editionEndsAt),
            // Minimum quantity of mints that will trigger the countdown.  Defaults to 1111n
            minimumMintsForCountdown: BigInt('0'),
          },
        },
        account: address,
        chainId: basePublicClient.chain.id,
      })

      // simulate the transaction
      const { request } = await basePublicClient.simulateContract(parameters)

      // execute the transaction
      const hash = await baseWalletClient.writeContract(request)

      // wait for the response
      const receipt = await basePublicClient.waitForTransactionReceipt({ hash })

      const editionTokenId = await extractTokenIdFromReceipt(receipt)

      if (!editionTokenId) {
        throw new Error('Could not extract token ID from transaction receipt')
      }

      setZoraEditionTokenId(String(editionTokenId))

      try {
        const response = (await fetchJson(
          `/api/save-edition-id/?songNbr=${songNbr}&editionTokenId=${editionTokenId}`
        )) as { success: boolean }

        if (!response.success) {
          toast.error('Error saving the edition token id')
          return
        }
      } catch (error) {
        toast.error('Error saving the edition token id')
        return
      }

      toast.success('Creating the edition. token id: ' + editionTokenId)
    } catch (error) {
      toast.error((error as any).error?.message || (error as any)?.message)
    } finally {
      setEditionLoading(false)
    }
  }

  const createAuctionHandler = async () => {
    setCreated(false)
    setLoading(true)
    try {
      if (!songNbr) {
        toast.error('Song number is not present')
        return
      }

      if (!ipfsHash) {
        toast.error('Song edition ipfs hash is not present')
        return
      }

      console.log(chain.id)
      console.log(GBM_L2_BASE_CHAIN)
      if (chain?.id !== GBM_L2_BASE_CHAIN) {
        toast.error('Switch to auction L2')
        return
      }

      if (!zoraEditionTokenId) {
        throw new Error('could not find edition token id')
      }

      toast.success('Creating the auction')
      const duration = DateTime.fromISO(date).diff(DateTime.local())

      const length = checked
        ? 86400
        : parseInt(duration.as('seconds').toString())

      const nowTimestamp = Math.floor(new Date().getTime() / 1000)

      const oneDayFromNow = nowTimestamp + 86400

      const endTimestamp = nowTimestamp + length

      const editionURI = 'ipfs://' + ipfsHash

      console.log(duration)
      console.log(oneDayFromNow)
      console.log(endTimestamp)
      console.log(editionURI)

      if (endTimestamp < oneDayFromNow) {
        throw new Error('End time must be at least 24 hours')
      }

      const usedEditionTokenUri = await readContract(config, {
        chainId: GBM_L2_BASE_CHAIN,
        address: GBM_L2_BASE_EDITION_CONTRACT_ADDRESS,
        abi: zoraeditionabi,
        functionName: 'uri',
        args: [BigInt(zoraEditionTokenId)],
      })

      if (editionURI !== usedEditionTokenUri) {
        throw new Error(
          `Token URI does not match the zora edition's token URI (zora token id: ${zoraEditionTokenId})`
        )
      }

      const hash = await writeContract(config, {
        chain: extractChain({
          chains: chains,
          id: GBM_L2_BASE_CHAIN,
        }),
        account: address,
        chainId: GBM_L2_BASE_CHAIN,
        address: GBM_L2_BASE_CONTRACT_ADDRESS,
        abi: gbml2abi,
        functionName: 'registerAnAuctionTokenSongAdao',
        args: [
          GBM_L2_BASE_IOU_CONTRACT_ADDRESS,
          BigInt(songNbr),
          BigInt(1),
          BigInt(endTimestamp),
          BigInt(zoraEditionTokenId),
        ],
      })

      toast.success('Waiting for tx to confirm')

      await waitForTransactionReceipt(config, {
        hash,
        chainId: GBM_L2_BASE_CHAIN,
        confirmations: 1,
      })

      await fetchJson(`/api/index-song/?token_id=${songNbr}`)

      toast.success('Auction created')
      setCreated(true)

      openSolanaForm(Number(songNbr))
    } catch (error) {
      toast.error((error as any).error?.message || (error as any)?.message)
    } finally {
      setLoading(false)
    }
  }

  const sendHypersubHandler = async () => {
    setHypersubSent(false)
    setHypersubLoading(true)
    try {
      if (!songNbr) {
        toast.error('Song number is not present')
        return
      }

      console.log(chain.id)
      console.log(GBM_L2_BASE_CHAIN)
      if (chain?.id !== GBM_L2_BASE_CHAIN) {
        toast.error('Switch to auction L2')
        return
      }

      toast.success('Sending Hypersub editions')

      const contract = getContract({
        address: '0xee93739977708d8cdc7c16f25d7342e8bbc5e101',
        abi: parseAbi([
          'function ownerOf(uint256) view returns (address)',
          'function supplyDetail() view returns (uint256 count, uint256 cap)',
          'function subscriptionOf(address account) external view returns (uint256 tokenId, uint256 refundableAmount, uint256 rewardPoints, uint256 expiresAt)',
        ]),
        // @ts-ignore next-line
        client: { public: basePublicClient },
      })

      const tokenHolders = await getTokenHolders(contract)
      const subscriptions = await getBulkSubscriptions(contract, tokenHolders)
      const activeSubs = subscriptions.filter(
        (sub) => sub.expiresAt > new Date()
      )
      // const activeSubs: TokenDetail[] = [
      //   {
      //     owner: '0xf1f6Ccaa7e8f2f78E26D25b44d80517951c20284',
      //     tokenId: BigInt(1),
      //     refundableAmount: BigInt(1),
      //     rewardPoints: BigInt(1),
      //     expiresAt: new Date(),
      //   },
      //   {
      //     owner: '0xBCD17bC16d53D690Ba29d567E79d41d4a7049451',
      //     tokenId: BigInt(1),
      //     refundableAmount: BigInt(1),
      //     rewardPoints: BigInt(1),
      //     expiresAt: new Date(),
      //   },
      // ]
      console.log('Active Subs')
      console.log(activeSubs)

      if (activeSubs.length === 0) {
        throw new Error('No subscribers')
      }

      const auctionId = await readContract(config, {
        chainId: auctionNetwork,
        address: auctionAddress,
        abi: gbml2abi,
        functionName: 'getAuctionID',
        args: [
          GBM_L2_BASE_IOU_CONTRACT_ADDRESS,
          '0x73ad2146',
          BigInt(Number(songNbr)),
          BigInt(0),
        ],
      })
      console.log('Auction ID')
      console.log(auctionId)

      if (!auctionId) {
        throw new Error('Start the auction first')
      }

      const editionTokenId = await readContract(config, {
        chainId: auctionNetwork,
        address: auctionAddress,
        abi: gbml2abi,
        functionName: 'getEditionTokenId',
        args: [auctionId],
      })
      // const editionTokenId = BigInt(4)
      console.log('Edition Token ID')
      console.log(editionTokenId)

      if (!auctionId) {
        throw new Error('No edition ID found')
      }

      const mintCalldata = activeSubs.map((activeSub) => {
        return encodeFunctionData({
          abi: zoraeditionabi,
          functionName: 'adminMint',
          args: [activeSub.owner, editionTokenId, BigInt(1), '0x0'],
        })
      })
      console.log('Multicall calldata')
      console.log(mintCalldata)

      // const hash = await writeContract(config, {
      //   chain: extractChain({
      //     chains: chains,
      //     id: GBM_L2_BASE_CHAIN,
      //   }),
      //   account: address,
      //   chainId: GBM_L2_BASE_CHAIN,
      //   address: GBM_L2_BASE_EDITION_CONTRACT_ADDRESS,
      //   abi: zoraeditionabi,
      //   functionName: 'adminMint',
      //   args: [
      //     '0xf1f6Ccaa7e8f2f78E26D25b44d80517951c20284',
      //     editionTokenId,
      //     BigInt(1),
      //     '0x0',
      //   ],
      // })

      const hash = await writeContract(config, {
        chain: extractChain({
          chains: chains,
          id: GBM_L2_BASE_CHAIN,
        }),
        account: address,
        chainId: GBM_L2_BASE_CHAIN,
        address: GBM_L2_BASE_EDITION_CONTRACT_ADDRESS,
        abi: zoraeditionabi,
        functionName: 'multicall',
        args: [mintCalldata],
      })

      toast.success('Waiting for tx to confirm')

      await waitForTransactionReceipt(config, {
        hash,
        chainId: GBM_L2_BASE_CHAIN,
        confirmations: 1,
      })

      toast.success('Hypersub editions sent')
      setHypersubSent(true)
    } catch (error) {
      toast.error((error as any).error?.message || (error as any)?.message)
    } finally {
      setHypersubLoading(false)
    }
  }

  const onOpenSolanaForm = async () => {
    setSolanaFormLoading(true)
    try {
      if (!songNbr) {
        toast.error('Song number is not present')
        return
      }

      openSolanaForm(Number(songNbr))

      setSolanaFormLoading(true)
    } catch (error) {
      toast.error((error as any).error?.message || (error as any)?.message)
    } finally {
      setSolanaFormLoading(false)
    }
  }

  async function fetchEditionTokenId() {
    try {
      const editionTokenIdData = (await fetchJson(
        `/api/get-edition-id/?songNbr=${songNbr}`
      )) as { editionTokenId: number }

      const editionTokenId = editionTokenIdData?.editionTokenId
      // console.log(editionTokenId)

      if (editionTokenId) {
        setZoraEditionTokenId(String(editionTokenId))
      } else {
        setZoraEditionTokenId('')
      }
    } catch (error) {
      setZoraEditionTokenId('')
    }
  }

  useEffect(() => {
    fetchEditionTokenId()
  }, [songNbr])

  return (
    <Stack spacing="6">
      {isConnected && (
        <Stack>
          <Heading>Create Auction - GBM L2 Base</Heading>
          <Text>First you need to create an auction.</Text>
          <Stack spacing="6">
            <Stack spacing="4">
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Song #</FormLabel>
                    <Input
                      placeholder="4384"
                      type="text"
                      value={songNbr}
                      onChange={(e) => setSongNbr(e.target.value)}
                    />
                  </FormControl>
                </Box>

                <Box>
                  <FormControl isRequired>
                    <FormLabel>Edition IPFS Hash</FormLabel>
                    <Input
                      type="text"
                      placeholder="QvQSasdsaLKJHASDNasdalkasd"
                      value={ipfsHash}
                      onChange={(e) => setIpfsHash(e.target.value)}
                    />
                  </FormControl>
                </Box>

                <Box>
                  <FormControl isRequired>
                    <FormLabel>Edition Token ID</FormLabel>
                    <Input
                      type="text"
                      placeholder="Zora Edition Token ID"
                      value={zoraEditionTokenId}
                      onChange={(e) => setZoraEditionTokenId()}
                    />
                  </FormControl>
                </Box>
              </Wrap>
              <Checkbox
                colorScheme="green"
                isChecked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              >
                Run the auction for 24 hours (86400 seconds)
              </Checkbox>
              {!checked && (
                <Wrap>
                  <Box>
                    <FormControl isRequired>
                      <FormLabel>End Datetime</FormLabel>
                      <Input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </FormControl>
                  </Box>
                </Wrap>
              )}
            </Stack>
            <Stack>
              <Text>
                {/* Note 1: Make sure you are connected with the correct wallet
                address (It should be the DAO's multisig address) */}
                Note 1: Make sure you are connected with the correct wallet
                address (It should be jmann.eth on Base)
              </Text>
            </Stack>
            <Wrap>
              {(chain?.id === GBM_L2_BASE_CHAIN && (
                <Button
                  loadingText="Creating"
                  isLoading={editionLoading}
                  disabled={editionLoading || hypersubLoading}
                  onClick={() => createZoraEditionHandler()}
                >
                  Create Zora Edition
                </Button>
              )) || (
                <Button
                  onClick={() => switchChain({ chainId: GBM_L2_BASE_CHAIN })}
                >
                  Switch Chain
                </Button>
              )}
            </Wrap>

            <Wrap>
              {(chain?.id === GBM_L2_BASE_CHAIN && (
                <Button
                  loadingText="Creating"
                  isLoading={loading}
                  disabled={loading || editionLoading || hypersubLoading}
                  onClick={() => createAuctionHandler()}
                >
                  Create Auction
                </Button>
              )) || (
                <Button
                  onClick={() => switchChain({ chainId: GBM_L2_BASE_CHAIN })}
                >
                  Switch Chain
                </Button>
              )}
            </Wrap>

            <Wrap>
              {(chain?.id === GBM_L2_BASE_CHAIN && (
                <Button
                  loadingText="Sending Editions"
                  isLoading={hypersubLoading}
                  disabled={loading || editionLoading || hypersubLoading}
                  onClick={() => sendHypersubHandler()}
                >
                  Send Hypersub Editions
                </Button>
              )) || (
                <Button
                  onClick={() => switchChain({ chainId: GBM_L2_BASE_CHAIN })}
                >
                  Switch Chain
                </Button>
              )}
            </Wrap>

            <Wrap>
              <Button
                loadingText="Opening Solana Form"
                isLoading={solanaFormLoading}
                disabled={loading || hypersubLoading || solanaFormLoading}
                onClick={() => onOpenSolanaForm()}
              >
                Open Solana NFT Form
              </Button>
            </Wrap>

            <Stack>
              {created && (
                <>
                  <Text>Next Steps:</Text>
                  <Text>
                    Your auction has started. It should show up on the songadao
                    auction page.
                  </Text>
                </>
              )}

              {hypersubSent && (
                <>
                  <Text>Next Steps:</Text>
                  <Text>
                    The daily base editions for Hypersub subscribers have been
                    sent.
                  </Text>
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}
      {!isConnected && (
        <Text>
          You need to be connected to the Base auction wallet to create an
          auction. Use the Connect Wallet Button to connect
        </Text>
      )}
    </Stack>
  )
}

CreateAuctionGBML2.Layout = AppLayout
export default CreateAuctionGBML2
