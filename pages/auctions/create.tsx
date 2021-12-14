import { AppLayout } from '@/components/AppLayout'
import { SongADay, SongADay__factory } from '@/types'
import { SONG_CONTRACT, ZERO_ADDRESS } from '@/utils/constants'
import { DEFAULT_NETWORK } from '@/web3/constants'
import { useContract } from '@/web3/hooks'
import { useWallet } from '@/web3/WalletContext'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import { Checkbox } from '@chakra-ui/react'
import { AuctionHouse } from '@zoralabs/zdk'
import { ethers } from 'ethers'
import { DateTime } from 'luxon'
import { useState } from 'react'
import toast from 'react-hot-toast'

const CreateAuction = () => {
  const [approved, setApproved] = useState(false)
  const [created, setCreated] = useState(false)
  const [songNbr, setSongNbr] = useState<string>()
  const [checked, setChecked] = useState(true)
  const [date, setDate] = useState<string>(
    `${DateTime.local().plus({ day: 1 }).toISODate()}T00:00`
  )
  const [loading, setLoading] = useState(false)
  const { isConnected, chainId, provider } = useWallet()
  const { contract: songContract } = useContract(
    SONG_CONTRACT,
    SongADay__factory
  )

  const auctionHouseContract = new AuctionHouse(
    provider?.getSigner() as any,
    (chainId as number) || DEFAULT_NETWORK
  )

  const auctionHouseAccount = auctionHouseContract.auctionHouse.address

  const approveAuctionHandler = async () => {
    setLoading(true)
    try {
      const approvedAddress = await (songContract as SongADay)?.getApproved(
        songNbr as string
      )
      if (approvedAddress !== auctionHouseAccount) {
        toast.success('Approving the Auction house to use the Song Contract')
        await (songContract as SongADay)?.approve(
          auctionHouseAccount,
          songNbr as string
        )
        toast.success(
          'Wait for transaction confirmation before creating the auction'
        )
        setApproved(true)
      } else {
        setApproved(true)
        toast.error('Already Approved')
      }
    } catch (error) {
      toast.error((error as any).error?.message || (error as any)?.message)
    } finally {
      setLoading(false)
    }
  }

  const createAuctionHandler = async () => {
    setCreated(false)
    setLoading(true)
    try {
      const approvedAddress = await (songContract as SongADay)?.getApproved(
        songNbr as string
      )
      if (approvedAddress !== auctionHouseAccount) {
        toast.error('You need to first approve')
        return
      }
      toast.success('Creating the auction')
      const duration = DateTime.fromISO(date).diff(DateTime.local())
      await auctionHouseContract.createAuction(
        songNbr as string,
        checked ? 86400 : parseInt(duration.as('seconds').toString()),
        ethers.utils.parseEther('0.000000001'),
        ZERO_ADDRESS,
        0,
        ZERO_ADDRESS,
        (songContract as any)?.address
      )

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
          <Heading>Create Auction</Heading>
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
                loadingText="Approving"
                isLoading={loading}
                disabled={loading || approved}
                onClick={() => approveAuctionHandler()}
              >
                Create Auction
              </Button>
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

CreateAuction.Layout = AppLayout
export default CreateAuction
