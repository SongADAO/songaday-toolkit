import { AppLayout } from '@/components/AppLayout'
import { songabi } from '@/utils/abi/songabi'
import { SONG_CONTRACT } from '@/utils/constants'
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
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { extractChain } from 'viem'
import { wagmiConfig as config, chains } from '@/utils/wagmi'

type FormValues = {
  songNbr: string
  ipfsHash: string
}

const Mint = () => {
  const { register, handleSubmit } = useForm<FormValues>()
  const [minted, setMinted] = useState(false)

  const [loading, setLoading] = useState(false)

  const { isConnected, address } = useAccount()

  const handleConfirm = () => {
    toast.success('Song Minted')
    // TODO: check if treasury owns the minted song
  }
  const handleError = (error: any) => {
    toast.error(error.error?.message || error.message)
  }
  const handleResponse = () => toast.success('Waiting for tx to confirm')

  const onSubmit = async (data: FormValues) => {
    setMinted(false)
    setLoading(true)
    try {
      const hash = await writeContract(config, {
        chain: extractChain({
          chains: chains,
          id: 1,
        }),
        chainId: 1,
        account: address,
        address: SONG_CONTRACT,
        abi: songabi,
        functionName: 'dailyMint',
        args: [BigInt(data.songNbr), data.ipfsHash],
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
