import { ethers } from 'ethers'
import { AppLayout } from '@/components/AppLayout'
import { SongADayEditions__factory } from '@/types-edition'
import { SONG_EDITION_CONTRACT } from '@/utils/constants'
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

  const { isConnected } = useWallet()
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

  const onSubmit = async (data: FormValues) => {
    const receiver = '0x322EFF886E9dc223963E0A9e68DcED069C8D3e45'
    const feeNumerator = 1

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

    setMinted(false)
    setLoading(true)
    try {
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
