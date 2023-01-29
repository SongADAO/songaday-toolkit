import { ethers } from 'ethers'
import { AppLayout } from '@/components/AppLayout'
import { SongADayEditions__factory } from '@/types-edition'
import { TREASURY_CONTRACT, SONG_EDITION_CONTRACT } from '@/utils/constants'
import { useTypedContract, useWriteContract } from '@raidguild/quiver'
import { useWallet } from '@raidguild/quiver'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { DateTime } from 'luxon'
import { SplitsClient } from '@0xsplits/splits-sdk'

type FormValues = {
  songNbr: string
  ipfsHash: string
  startTime: string
  endTime: string
  mintPrice: number
  sadnftOwner: string
  sadnftOwnerSignature: string
}

const MintEdition = () => {
  const { register, handleSubmit } = useForm<FormValues>()
  const [minted, setMinted] = useState(false)

  const [loading, setLoading] = useState(false)

  const { isConnected, chainId, provider } = useWallet()
  const { contract: songEditionContract } = useTypedContract(
    SONG_EDITION_CONTRACT,
    SongADayEditions__factory
  )

  const handleConfirm = () => {
    toast.success('Song Minted')
    // TODO: check if treasury owns the minted song
  }
  const handleError = (error: any) => {
    toast.error(error.error?.message || error.message)
  }
  const handleResponse = () => toast.success('Waiting for tx to confirm')

  const { mutate: registerMint } = useWriteContract(
    songEditionContract,
    'registerMint',
    {
      onError: handleError,
      onResponse: handleResponse,
      onConfirmation: handleConfirm,
    }
  )

  const standardizeSignature = (signature: string) => {
    if (signature.slice(-2) === '00') {
      return signature.slice(0, -2) + '1b'
    }

    if (signature.slice(-2) === '01') {
      return signature.slice(0, -2) + '1c'
    }

    return signature
  }

  const onSubmit = async (data: FormValues) => {
    if (!isConnected || !provider || !chainId) {
      return
    }

    setMinted(false)
    setLoading(true)
    try {
      const message =
        'By singing this message I authorize the editioning of SADNFT ' +
        data.songNbr

      const messageHash = ethers.utils.solidityKeccak256(['string'], [message])

      const signerAddress = ethers.utils.verifyMessage(
        messageHash,
        data.sadnftOwnerSignature
      )

      if (data.sadnftOwner !== signerAddress) {
        throw new Error('Signature is not valid')
      }

      const chainIdNumber = Number(chainId.substring(2))

      const splitsClient = new SplitsClient({
        chainId: chainIdNumber,
        provider: provider as any,
        signer: provider?.getSigner() as any,
      })

      const args = {
        recipients: [
          {
            address: data.sadnftOwner,
            percentAllocation: 50.0,
          },
          {
            address: TREASURY_CONTRACT,
            percentAllocation: 50.0,
          },
        ],
        distributorFeePercent: 1.0,
        // TODO: Set distributorFeePercent
        controller: TREASURY_CONTRACT,
      }

      const response = await splitsClient.createSplit(args)
      console.log(response)

      const receiver = response.splitId
      const feeNumerator = 250 // 2.5%
      // TODO: Set feeNumerator

      const mintPriceWei = ethers.utils.parseUnits(
        data.mintPrice.toString(),
        'ether'
      )

      const startTimeDate = DateTime.fromISO(data.startTime)
      const endTimeDate = DateTime.fromISO(data.endTime)
      console.log(startTimeDate)
      console.log(endTimeDate)

      console.log(data.songNbr)
      console.log(data.ipfsHash)
      console.log(startTimeDate.toMillis())
      console.log(endTimeDate.toMillis())
      console.log(mintPriceWei)
      console.log(data.sadnftOwner)
      console.log(data.sadnftOwnerSignature)
      console.log(receiver)
      console.log(feeNumerator)

      await registerMint(
        data.songNbr,
        data.ipfsHash,
        startTimeDate.toMillis(),
        endTimeDate.toMillis(),
        mintPriceWei,
        data.sadnftOwner,
        data.sadnftOwnerSignature,
        receiver,
        feeNumerator
      )
      setMinted(true)
    } catch (error) {
      toast.error((error as any).message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Stack spacing="6">
      {isConnected && (
        <Stack>
          <Heading>Mint a song edition</Heading>
          <Text>
            Find the IPFS metadata hash from the upload to ipfs step and paste
            the hash below along with the song number. This will setup a song
            edition so that it can be sold via a public open edition sale.
          </Text>
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
                    <Text>
                      Now you can create the auction by going to the auctions
                      page.
                    </Text>
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
