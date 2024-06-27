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
import { ethers } from 'ethers'
import { DateTime } from 'luxon'
import { useState } from 'react'
import toast from 'react-hot-toast'
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk'
import fetchJson from '@/utils/fetchJson'
import { useAccount } from 'wagmi'
import { encodeFunctionData } from 'viem'
import { songabi } from '@/utils/abi/songabi'
import { gbminitabi } from '@/utils/abi/gbminitabi'
import { gbmabi } from '@/utils/abi/gbmabi'

const MintAndAuctionGBM = () => {
  const [created, setCreated] = useState(false)
  const [songNbr, setSongNbr] = useState<string>('')
  const [ipfsHash, setIpfsHash] = useState<string>('')
  const [checked, setChecked] = useState(true)
  const [date, setDate] = useState<string>(
    `${DateTime.local().plus({ day: 1 }).toISODate()}T00:00`
  )
  const [loading, setLoading] = useState(false)

  const { isConnected } = useAccount()

  // const { isConnected, chainId, provider } = useWallet()

  const [indexingSong, setIndexingSong] = useState<boolean>(false)

  // const { contract: songContract } = useTypedContract(
  //   SONG_CONTRACT,
  //   SongADay__factory
  // )

  // const { contract: gbmContract } = useTypedContract(GBM_CONTRACT, GBM__factory)

  // const { contract: gbmInitiatorContract } = useTypedContract(
  //   GBM_INITIATOR_CONTRACT,
  //   GBMInitiator__factory
  // )

  const opts = {
    allowedDomains: [/gnosis-safe.io/],
  }

  const appsSdk = new SafeAppsSDK(opts)

  const indexSong = async () => {
    if (!songNbr) {
      toast.error('Please enter a song > 4748')
      return
    }
    if (Number(songNbr) <= 4748) {
      toast.error('Please enter a song > 4748')
      return
    }

    try {
      setIndexingSong(true)
      await fetchJson(`/api/index-song/?token_id=${songNbr}`)
    } catch (error) {
      console.log({ error })
    } finally {
      setIndexingSong(false)
    }
  }

  const handleMintAndAuction = async () => {
    console.log('inside')
    if (!songNbr || !ipfsHash) {
      toast.error('Either song number of ipfs hash is not present')
      return
    }

    setLoading(true)
    setCreated(false)

    const duration = DateTime.fromISO(date).diff(DateTime.local())

    const length = checked ? 86400 : parseInt(duration.as('seconds').toString())

    const nowTimestamp = Math.floor(new Date().getTime() / 1000)

    const endTimestamp = nowTimestamp + length

    console.log(endTimestamp)

    const transactions = [
      {
        to: SONG_CONTRACT ?? '',
        value: '0',
        data: encodeFunctionData({
          abi: songabi,
          functionName: 'dailyMint',
          args: [BigInt(songNbr), ipfsHash],
        }),
      },
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

    try {
      await appsSdk?.txs.send({ txs: transactions })
      setCreated(true)
      toast.success(
        'The transaction will appear soon in your gnosis transactions'
      )
    } catch (error) {
      console.log(error)
      toast.error(
        'There was an error processing the transaction, please do it manually.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing="6">
      {isConnected && (
        <Stack>
          <Heading>Mint and Create Auction - GBM</Heading>
          <Text>
            Note - This page will only work if you open it inside gnosis safe as
            a safe app. If you use it via walletconnect, it will not work
          </Text>
          <Text>
            Find the IPFS metadata hash from the upload to ipfs step and paste
            the hash below along with the song number.
          </Text>
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
                    <FormLabel>IPFS Hash</FormLabel>
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
              <Button
                loadingText="Creating"
                isLoading={loading}
                disabled={loading}
                onClick={() => handleMintAndAuction()}
              >
                Mint and Start Auction
              </Button>
              <Button
                loadingText="Indexing"
                isLoading={indexingSong}
                disabled={indexingSong}
                onClick={() => indexSong()}
              >
                Index Song
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

export default MintAndAuctionGBM
