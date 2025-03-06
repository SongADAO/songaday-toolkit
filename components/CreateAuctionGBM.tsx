import { AppLayout } from '@/components/AppLayout'
import {
  GBM_CONTRACT,
  GBM_INITIATOR_CONTRACT,
  TREASURY_CONTRACT,
  SONG_CONTRACT,
  ZERO_ADDRESS,
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
  Checkbox,
} from '@chakra-ui/react'
import { DateTime } from 'luxon'
import { useState } from 'react'
import toast from 'react-hot-toast'
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk'
import { useAccount, useContractRead } from 'wagmi'
import { encodeFunctionData } from 'viem'
import { songabi } from '@/utils/abi/songabi'
import { gbminitabi } from '@/utils/abi/gbminitabi'
import { gbmabi } from '@/utils/abi/gbmabi'

const CreateAuctionGBM = () => {
  const [approved, setApproved] = useState(false)
  const [created, setCreated] = useState(false)
  const [songNbr, setSongNbr] = useState<string>('')
  const [checked, setChecked] = useState(true)
  const [date, setDate] = useState<string>(
    `${DateTime.local().plus({ day: 1 }).toISODate()}T00:00`
  )
  const [loading, setLoading] = useState(false)
  const { isConnected } = useAccount()
  const opts = {
    allowedDomains: [/gnosis-safe.io/],
  }

  const appsSdk = new SafeAppsSDK(opts)

  const createAuctionHandler = async () => {
    setCreated(false)
    setLoading(true)
    try {
      if (!songNbr) {
        toast.error('Song number is not present')
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

      const transactions = [
        {
          to: SONG_CONTRACT ?? '',
          value: '0',
          data: encodeFunctionData({
            abi: songabi,
            functionName: 'safeTransferFrom',
            args: [TREASURY_CONTRACT, GBM_CONTRACT, BigInt(songNbr)],
          }),
        },
        {
          to: GBM_INITIATOR_CONTRACT ?? '',
          value: '0',
          data: encodeFunctionData({
            abi: gbminitabi,
            functionName: 'setEndTime',
            args: [BigInt(endTimestamp)],
          }),
        },
        {
          to: GBM_CONTRACT ?? '',
          value: '0',
          data: encodeFunctionData({
            abi: gbmabi,
            functionName: 'registerAnAuctionToken',
            args: [
              SONG_CONTRACT,
              BigInt(songNbr),
              '0x73ad2146',
              BigInt(1),
              GBM_INITIATOR_CONTRACT,
            ],
          }),
        },
      ]

      await appsSdk?.txs.send({ txs: transactions })

      toast.success(
        'Wait for transaction confirmation before going to song a day auction page'
      )
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
          <Heading>Create Auction - GBM</Heading>
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
              <Button
                loadingText="Creating"
                isLoading={loading}
                disabled={loading}
                onClick={() => createAuctionHandler()}
              >
                Create Auction
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
            </Stack>
          </Stack>
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

CreateAuctionGBM.Layout = AppLayout
export default CreateAuctionGBM
