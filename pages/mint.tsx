import { AppLayout } from '@/components/AppLayout'
import { SongADay__factory } from '@/types'
import { SONG_CONTRACT } from '@/utils/constants'
import { useContract, useWriteContract } from '@raidguild/quiver'
import { useWallet } from '@raidguild/quiver'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

type FormValues = {
  songNbr: string
  ipfsHash: string
}

const Mint = () => {
  const { register, handleSubmit } = useForm<FormValues>()
  const [minted, setMinted] = useState(false)

  const [loading, setLoading] = useState(false)

  const { isConnected } = useWallet()
  const { contract: songContract } = useContract(
    SONG_CONTRACT,
    SongADay__factory
  )

  const handleConfirm = () => {
    toast.success('Song Minted')
    // TODO: check if treasury owns the minted song
  }
  const handleError = (error: any) => {
    toast.error(error.error?.message || error.message)
  }
  const handleResponse = () => toast.success('Waiting for tx to confirm')

  const { mutate: mint } = useWriteContract(songContract, 'dailyMint', {
    onError: handleError,
    onResponse: handleResponse,
    onConfirmation: handleConfirm,
  })

  const onSubmit = async (data: FormValues) => {
    setMinted(false)
    setLoading(true)
    try {
      await mint(data.songNbr, data.ipfsHash)
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
          <Heading>Mint a song</Heading>
          <Text>
            Find the IPFS metadata hash from the upload to ipfs step and paste
            the hash below along with the song number. This will mint a new song
            on the SongADAO smart contract.
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
                  Mint Song
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

Mint.Layout = AppLayout
export default Mint
