// @ts-nocheck

import { ethers } from 'ethers'
import { AppLayout } from '@/components/AppLayout'
import {
  TREASURY_CONTRACT_OPTIMISM,
  SONG_EDITION_CONTRACT,
  SONG_EDITION_CHAIN_ID,
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
} from '@chakra-ui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { DateTime } from 'luxon'
import { SplitsClient } from '@0xsplits/splits-sdk'
import { useAccount } from 'wagmi'
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { editionabi } from '@/utils/abi/editionabi'
import { wagmiConfig as config, chains } from '@/utils/wagmi'

import * as React from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { providers } from 'ethers'
import {
  type PublicClient,
  type WalletClient,
  type HttpTransport,
  parseUnits,
  extractChain,
} from 'viem'

function publicClientToProvider(publicClient: PublicClient) {
  const { chain, transport } = publicClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<HttpTransport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network)
      )
    )
  return new providers.JsonRpcProvider(transport.url, network)
}

/** Hook to convert a viem Public Client to an ethers.js Provider. */
function useEthersProvider({ chainId }: { chainId?: number } = {}) {
  const publicClient = usePublicClient({ chainId })
  return React.useMemo(
    () => publicClientToProvider(publicClient),
    [publicClient]
  )
}

function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  // @ts-ignore
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId })
  return React.useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  )
}

type FormValues = {
  split: string
  songNbr: string
  ipfsHash: string
  startTime: string
  endTime: string
  mintPrice: number
  sadnftOwner: string
  sadnftOwnerSignature: string
}

type SplitFormValues = {
  splitRecipient: string
}

const MintEdition = () => {
  const { register, handleSubmit } = useForm<FormValues>()

  const {
    register: registerSplit,
    handleSubmit: handleSubmitSplit,
    formState: { errors: errorsSplit },
    watch: watchSplit,
  } = useForm<SplitFormValues>({})

  const [minted, setMinted] = useState(false)

  const [loading, setLoading] = useState(false)

  const [splitLoading, setSplitLoading] = useState(false)

  const [splitAddress, setSplitAddress] = useState('')

  const { isConnected, chain, address } = useAccount()
  const signer = useEthersSigner()
  const provider = useEthersProvider()

  const handleConfirm = () => {
    toast.success('Song Minted')
    // TODO: check if treasury owns the minted song
  }
  const handleError = (error: any) => {
    toast.error(error.error?.message || error.message)
  }
  const handleResponse = () => toast.success('Waiting for tx to confirm')

  const standardizeSignature = (signature: string) => {
    if (signature.slice(-2) === '00') {
      return signature.slice(0, -2) + '1b'
    }

    if (signature.slice(-2) === '01') {
      return signature.slice(0, -2) + '1c'
    }

    return signature
  }

  const onCreateSplit = async (data: SplitFormValues) => {
    if (!isConnected || !provider || !chain?.id) {
      return
    }

    throw new Error('Needs updated to splits v2')

    setSplitLoading(true)
    try {
      if (chain?.id !== SONG_EDITION_CHAIN_ID) {
        throw new Error('Please switch to Optimism')
      }

      const chainIdNumber = SONG_EDITION_CHAIN_ID

      const splitsClient = new SplitsClient({
        chainId: chainIdNumber,
        provider: provider as any,
        signer: signer,
      })

      const distributorFeePercent =
        data.splitRecipient.toLowerCase() ===
          '0x728A74CF54C6B60D33B71A09098b89e900043BD4' ||
        data.splitRecipient.toLowerCase() ===
          '0x5059270bafde9457e5c87312ff1fa9025c060499' ||
        data.splitRecipient.toLowerCase() ===
          '0x9d42a4d69e02d81f6f6d140fee4d92ca3f22c0d0'
          ? 0
          : 1.0

      const args = {
        recipients: [
          {
            address: data.splitRecipient,
            percentAllocation: 50.0,
          },
          {
            address: TREASURY_CONTRACT_OPTIMISM,
            percentAllocation: 50.0,
          },
        ],
        distributorFeePercent: distributorFeePercent,
        controller: TREASURY_CONTRACT_OPTIMISM,
      }
      console.log(args)

      const response = await splitsClient.createSplit(args)
      console.log(response)

      const receiver = response.splitId

      setSplitAddress(receiver)
    } catch (error) {
      toast.error((error as any).message)
    } finally {
      setSplitLoading(false)
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!isConnected || !provider || !chain?.id) {
      return
    }

    throw new Error('Needs updated to viem')

    setMinted(false)
    setLoading(true)
    try {
      if (chain?.id !== SONG_EDITION_CHAIN_ID) {
        throw new Error('Please switch to Optimism')
      }

      const message =
        'By singing this message I authorize the editioning of SADNFT ' +
        data.songNbr

      const messageHash = ethers.utils.solidityKeccak256(['string'], [message])

      const bytesDataHash = ethers.utils.arrayify(messageHash)

      const signerAddress = ethers.utils.verifyMessage(
        bytesDataHash,
        data.sadnftOwnerSignature
      )

      if (data.sadnftOwner !== signerAddress) {
        throw new Error('Signature is not valid')
      }

      const feeNumerator = 250 // 2.5%
      // TODO: Set feeNumerator

      const mintPriceWei = parseUnits(data.mintPrice.toString(), 18)
      console.log(data.mintPrice.toString())
      console.log(mintPriceWei)

      const ipfsUrl = 'ipfs://' + data.ipfsHash

      const startTimeDate = DateTime.fromISO(data.startTime)
      const endTimeDate = DateTime.fromISO(data.endTime)
      console.log(startTimeDate)
      console.log(endTimeDate)

      const startTimeDateSeconds = startTimeDate.toMillis() / 1000
      const endTimeDateSeconds = endTimeDate.toMillis() / 1000

      console.log(data.songNbr)
      console.log(data.ipfsHash)
      console.log(ipfsUrl)
      console.log(startTimeDateSeconds)
      console.log(endTimeDateSeconds)
      console.log(mintPriceWei)
      console.log(data.sadnftOwner)
      console.log(data.sadnftOwnerSignature)
      console.log(data.split)
      console.log(feeNumerator)

      const hash = await writeContract(config, {
        chain: extractChain({
          chains: chains,
          id: SONG_EDITION_CHAIN_ID,
        }),
        chainId: SONG_EDITION_CHAIN_ID,
        account: address,
        address: SONG_EDITION_CONTRACT,
        abi: editionabi,
        functionName: 'registerMint',
        args: [
          BigInt(data.songNbr),
          ipfsUrl,
          BigInt(startTimeDateSeconds),
          BigInt(endTimeDateSeconds),
          mintPriceWei,
          data.sadnftOwner as `0x{string}`,
          data.sadnftOwnerSignature as `0x{string}`,
          data.split as `0x{string}`,
          BigInt(feeNumerator),
        ],
      })
      handleResponse()
      await waitForTransactionReceipt(config, { hash })
      handleConfirm()

      setMinted(true)
    } catch (error) {
      toast.error((error as any).message)
      handleError(error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Stack spacing="6">
      {isConnected && chain?.id !== SONG_EDITION_CHAIN_ID && (
        <Text>Please switch to Optimism</Text>
      )}
      {isConnected && chain?.id === SONG_EDITION_CHAIN_ID && (
        <Stack>
          <Heading>Mint a song edition</Heading>
          <Text>
            Find the IPFS metadata hash from the upload to ipfs step and paste
            the hash below along with the song number. This will setup a song
            edition so that it can be sold via a public open edition sale.
          </Text>
          <form onSubmit={handleSubmitSplit(onCreateSplit)}>
            <Stack spacing="6">
              <Stack spacing="4">
                <Wrap>
                  <Box>
                    <FormControl isRequired>
                      <FormLabel>Split Recipient</FormLabel>
                      <Input
                        placeholder="wallet address"
                        type="text"
                        {...registerSplit('splitRecipient', {
                          required: true,
                        })}
                      />
                    </FormControl>
                  </Box>
                </Wrap>
              </Stack>
              <Stack>
                <Text>
                  Note 1: Make sure you are connected with the correct wallet
                  address (It should be the DAO's multisig address)
                </Text>
              </Stack>
              <Wrap>
                <Button
                  loadingText="Minting"
                  isLoading={splitLoading}
                  disabled={splitLoading}
                  onClick={handleSubmitSplit(onCreateSplit)}
                >
                  Setup 0xSplit
                </Button>
              </Wrap>
              <Stack>
                {splitAddress && (
                  <>
                    <Text>
                      <strong>Split Address:</strong> {splitAddress}
                    </Text>
                    <br />
                    <br />
                  </>
                )}
              </Stack>
            </Stack>
          </form>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing="6">
              <Stack spacing="4">
                <Wrap>
                  <Box>
                    <FormControl isRequired>
                      <FormLabel>Song #</FormLabel>
                      <Input
                        placeholder="4384"
                        type="text"
                        {...register('songNbr', { required: true })}
                      />
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl isRequired>
                      <FormLabel>IPFS Hash</FormLabel>
                      <Input
                        type="text"
                        placeholder="QvQSasdsaLKJHASDNasdalkasd"
                        {...register('ipfsHash', { required: true })}
                      />
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl isRequired>
                      <FormLabel>Mint Start Time</FormLabel>
                      <Input
                        placeholder=""
                        type="datetime-local"
                        {...register('startTime', { required: true })}
                      />
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl isRequired>
                      <FormLabel>Mint End Time</FormLabel>
                      <Input
                        placeholder=""
                        type="datetime-local"
                        {...register('endTime', { required: true })}
                      />
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl isRequired>
                      <FormLabel>Mint Price (in ETH)</FormLabel>
                      <Input
                        placeholder=""
                        type="number"
                        {...register('mintPrice', { required: true })}
                      />
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl isRequired>
                      <FormLabel>0xSplit</FormLabel>
                      <Input
                        placeholder=""
                        type="text"
                        {...register('split', { required: true })}
                      />
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl isRequired>
                      <FormLabel>SAD NFT Owner</FormLabel>
                      <Input
                        placeholder=""
                        type="text"
                        {...register('sadnftOwner', { required: true })}
                      />
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl isRequired>
                      <FormLabel>SAD NFT Owner Signature</FormLabel>
                      <Input
                        placeholder=""
                        type="text"
                        {...register('sadnftOwnerSignature', {
                          required: true,
                        })}
                      />
                    </FormControl>
                  </Box>
                </Wrap>
              </Stack>
              <Stack>
                <Text>
                  Note 1: Make sure you are connected with the correct wallet
                  address (It should be the DAO's multisig address)
                </Text>
              </Stack>
              <Wrap>
                <Button
                  loadingText="Minting"
                  isLoading={loading}
                  disabled={loading}
                  onClick={handleSubmit(onSubmit)}
                >
                  Mint Song Edition
                </Button>
              </Wrap>
              <Stack>
                {minted && (
                  <>
                    <Text>Next Steps:</Text>
                    <Text>The edition is now ready.</Text>
                  </>
                )}
              </Stack>
            </Stack>
          </form>
        </Stack>
      )}
      {!isConnected && (
        <Text>
          You need to be connected to the DAO's Wallet to mint a song. Use the
          Connect Wallet Button to connect
        </Text>
      )}
    </Stack>
  )
}

MintEdition.Layout = AppLayout
export default MintEdition
