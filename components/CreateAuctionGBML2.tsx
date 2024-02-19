import { AppLayout } from '@/components/AppLayout'
import {
  GBM_L2_CONTRACT_ADDRESS,
  GBM_L2_CHAIN,
  SONG_CONTRACT,
} from '@/utils/constants'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import { Checkbox } from '@chakra-ui/react'
import { DateTime } from 'luxon'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { writeContract, waitForTransaction } from '@wagmi/core'
import { gbml2abi } from '@/utils/abi/gbml2abi'

const CreateAuctionGBML2 = () => {
  const [created, setCreated] = useState(false)
  const [songNbr, setSongNbr] = useState<string>()
  const [ipfsHash, setIpfsHash] = useState<string>()
  const [checked, setChecked] = useState(true)
  const [date, setDate] = useState<string>(
    `${DateTime.local().plus({ day: 1 }).toISODate()}T00:00`
  )
  const [loading, setLoading] = useState(false)
  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  const { isLoading: isSwitching, switchNetwork } = useSwitchNetwork()

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
      console.log(GBM_L2_CHAIN)
      if (chain?.id !== GBM_L2_CHAIN) {
        toast.error('Switch to auction L2')
        return
      }

      toast.success('Creating the auction')
      const duration = DateTime.fromISO(date).diff(DateTime.local())

      const length = checked
        ? 86400
        : parseInt(duration.as('seconds').toString())

      const nowTimestamp = Math.floor(new Date().getTime() / 1000)

      const endTimestamp = nowTimestamp + length

      console.log(endTimestamp)

      const { hash } = await writeContract({
        chainId: GBM_L2_CHAIN,
        address: GBM_L2_CONTRACT_ADDRESS,
        abi: gbml2abi,
        functionName: 'registerAnAuctionTokenSongAdao',
        args: [
          SONG_CONTRACT,
          BigInt(songNbr),
          ipfsHash,
          BigInt(1),
          BigInt(endTimestamp),
        ],
      })

      toast.success('Waiting for tx to confirm')
      await waitForTransaction({ hash })
      toast.success('Auction created')
      setCreated(true)
    } catch (error) {
      toast.error((error as any).error?.message || (error as any)?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing="6">
      {isConnected && (
        <Stack>
          <Heading>Create Auction - GBM L2</Heading>
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
                Note 1: Make sure you are connected with the correct wallet
                address (It should be the DAO's multisig address)
              </Text>
            </Stack>
            <Wrap>
              {(chain?.id === GBM_L2_CHAIN && (
                <Button
                  loadingText="Creating"
                  isLoading={loading}
                  disabled={loading}
                  onClick={() => createAuctionHandler()}
                >
                  Create Auction
                </Button>
              )) || (
                <Button
                  onClick={() => switchNetwork(GBM_L2_CHAIN)}
                  isLoading={isSwitching}
                >
                  Switch Chain
                </Button>
              )}
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

CreateAuctionGBML2.Layout = AppLayout
export default CreateAuctionGBML2
