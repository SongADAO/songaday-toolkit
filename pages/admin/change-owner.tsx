import { AppLayout } from '@/components/AppLayout'
import { SongADay, SongADay__factory } from '@/types'
import { SONG_CONTRACT } from '@/utils/constants'
import { useContract } from '@/web3/hooks'
import { useWallet } from '@/web3/WalletContext'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import { useState } from 'react'
import toast from 'react-hot-toast'

const ChangeOwner = () => {
  const [newOwner, setNewOwner] = useState<string>()
  const [loading, setLoading] = useState(false)
  const { isConnected } = useWallet()
  const { contract: songContract } = useContract(
    SONG_CONTRACT,
    SongADay__factory
  )

  const changeOwnerHandler = async () => {
    setLoading(true)
    try {
      const tx = await (songContract as SongADay)?.transferOwnership(
        newOwner?.trim() ?? ''
      )

      await tx.wait()
      toast.success(`${newOwner} is the new owner now.`)
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
          <Heading>Change Owner</Heading>
          <Text>
            Be careful, this will change the owner of the contract from your
            address to the address specified.
          </Text>
          <Stack spacing="6">
            <Stack spacing="4">
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>New Owner Address</FormLabel>
                    <Input
                      placeholder="0x0b0c157a225b749d8df323bf45b232034243e6cbc"
                      type="text"
                      value={newOwner}
                      onChange={(e) => setNewOwner(e.target.value)}
                    />
                  </FormControl>
                </Box>
              </Wrap>
            </Stack>
            <Wrap>
              <Button
                loadingText="Changing Owner"
                isLoading={loading}
                disabled={loading}
                onClick={() => changeOwnerHandler()}
              >
                Change Owner
              </Button>
            </Wrap>
          </Stack>
        </Stack>
      )}
      {!isConnected && (
        <Text>
          You need to be connected to the contract owner Wallet to change the
          owner. Use the Connect Wallet Button to connect
        </Text>
      )}
    </Stack>
  )
}

ChangeOwner.Layout = AppLayout
export default ChangeOwner
