import { AppLayout } from '@/components/AppLayout'
import {
  GBM_L2_ZORA_CONTRACT_ADDRESS,
  GBM_L2_ZORA_CHAIN,
  GBM_L2_ZORA_IOU_CONTRACT_ADDRESS,
  GBM_L2_ZORA_EDITION_MINTER,
  GBM_L2_ZORA_EDITION_CONTRACT_ADDRESS,
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
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAccount, useSwitchChain, usePublicClient } from 'wagmi'
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

const CreateAuctionGBML2Zora = () => {
  const [created, setCreated] = useState(false)
  const [hypersubSent, setHypersubSent] = useState(false)
  const [songNbr, setSongNbr] = useState<string>('')
  const [ipfsHash, setIpfsHash] = useState<string>('')
  const [checked, setChecked] = useState(true)
  const [date, setDate] = useState<string>(
    `${DateTime.local()
      .plus({ day: 1, minute: 5 })
      .toFormat('yyyy-LL-dd HH:mm:00')}`
  )
  const [loading, setLoading] = useState(false)
  const [hypersubLoading, setHypersubLoading] = useState(false)
  const [solanaFormLoading, setSolanaFormLoading] = useState(false)
  const { isConnected, chain, address } = useAccount()

  const { switchChain } = useSwitchChain()

  const zoraPublicClient = usePublicClient({ chainId: 7777777 })

  const auctionNetwork = GBM_L2_ZORA_CHAIN

  const auctionAddress = GBM_L2_ZORA_CONTRACT_ADDRESS

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
      console.log(GBM_L2_ZORA_CHAIN)
      if (chain?.id !== GBM_L2_ZORA_CHAIN) {
        toast.error('Switch to auction L2')
        return
      }

      toast.success('Creating the auction')
      const duration = DateTime.fromISO(date).diff(DateTime.local())

      const length = checked
        ? 86400
        : parseInt(duration.as('seconds').toString())

      const nowTimestamp = Math.floor(new Date().getTime() / 1000)

      const oneHourFromNow = nowTimestamp + 86400

      const endTimestamp = nowTimestamp + length

      const editionEndTimestamp = endTimestamp
      // const editionEndTimestamp = '18446744073709551615' // Never end

      const editionPrice = '0'
      // const editionPrice = '5000000000000000'

      const editionURI = 'ipfs://' + ipfsHash

      console.log(duration)
      console.log(oneHourFromNow)
      console.log(endTimestamp)
      console.log(editionEndTimestamp)
      console.log(editionPrice)
      console.log(editionURI)

      if (endTimestamp < oneHourFromNow) {
        throw new Error('End time must be at least 24 hours')
      }

      const hash = await writeContract(config, {
        chain: extractChain({
          chains: chains,
          id: GBM_L2_ZORA_CHAIN,
        }),
        account: address,
        chainId: GBM_L2_ZORA_CHAIN,
        address: GBM_L2_ZORA_CONTRACT_ADDRESS,
        abi: gbml2abi,
        functionName: 'registerAnAuctionTokenSongAdao',
        args: [
          GBM_L2_ZORA_IOU_CONTRACT_ADDRESS,
          BigInt(songNbr),
          BigInt(1),
          BigInt(endTimestamp),
          editionURI,
          GBM_L2_ZORA_EDITION_MINTER,
          BigInt(editionEndTimestamp),
          BigInt('0'),
          BigInt(editionPrice),
        ],
      })

      toast.success('Waiting for tx to confirm')

      await waitForTransactionReceipt(config, {
        hash,
        chainId: GBM_L2_ZORA_CHAIN,
        confirmations: 1,
      })

      if (GBM_L2_ZORA_CHAIN === 7777777) {
        await fetchJson(`/api/index-song/?token_id=${songNbr}`)
      }

      toast.success('Auction created')
      setCreated(true)

      if (GBM_L2_ZORA_CHAIN === 7777777) {
        openSolanaForm(Number(songNbr))
      }
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
      console.log(GBM_L2_ZORA_CHAIN)
      if (chain?.id !== GBM_L2_ZORA_CHAIN) {
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
        client: { public: zoraPublicClient },
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
          GBM_L2_ZORA_IOU_CONTRACT_ADDRESS,
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
      //     id: GBM_L2_ZORA_CHAIN,
      //   }),
      //   account: address,
      //   chainId: GBM_L2_ZORA_CHAIN,
      //   address: GBM_L2_ZORA_EDITION_CONTRACT_ADDRESS,
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
          id: GBM_L2_ZORA_CHAIN,
        }),
        account: address,
        chainId: GBM_L2_ZORA_CHAIN,
        address: GBM_L2_ZORA_EDITION_CONTRACT_ADDRESS,
        abi: zoraeditionabi,
        functionName: 'multicall',
        args: [mintCalldata],
      })

      toast.success('Waiting for tx to confirm')

      await waitForTransactionReceipt(config, {
        hash,
        chainId: GBM_L2_ZORA_CHAIN,
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

  return (
    <Stack spacing="6">
      {isConnected && (
        <Stack>
          <Heading>Create Auction - GBM L2 Zora</Heading>
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
                address (It should be jmann.eth on Zora L2)
              </Text>
            </Stack>
            <Wrap>
              {(chain?.id === GBM_L2_ZORA_CHAIN && (
                <Button
                  loadingText="Creating"
                  isLoading={loading}
                  disabled={loading || hypersubLoading}
                  onClick={() => createAuctionHandler()}
                >
                  Create Auction
                </Button>
              )) || (
                <Button
                  onClick={() => switchChain({ chainId: GBM_L2_ZORA_CHAIN })}
                >
                  Switch Chain
                </Button>
              )}
            </Wrap>

            <Wrap>
              {(chain?.id === GBM_L2_ZORA_CHAIN && (
                <Button
                  loadingText="Sending Editions"
                  isLoading={hypersubLoading}
                  disabled={loading || hypersubLoading}
                  onClick={() => sendHypersubHandler()}
                >
                  Send Hypersub Editions
                </Button>
              )) || (
                <Button
                  onClick={() => switchChain({ chainId: GBM_L2_ZORA_CHAIN })}
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
                    The daily zora editions for Hypersub subscribers have been
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
          You need to be connected to the Zora auction wallet to create an
          auction. Use the Connect Wallet Button to connect
        </Text>
      )}
    </Stack>
  )
}

CreateAuctionGBML2Zora.Layout = AppLayout
export default CreateAuctionGBML2Zora
