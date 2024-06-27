import { AppLayout } from '@/components/AppLayout'
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
import toast from 'react-hot-toast'
import { useAccount } from 'wagmi'
import { writeContract, waitForTransaction } from '@wagmi/core'
import { songabi } from '@/utils/abi/songabi'
const ChangeOwner = () => {
  const [newOwner, setNewOwner] = useState<string>()
  const [loading, setLoading] = useState(false)
  const { isConnected } = useAccount()

  const changeOwnerHandler = async () => {
    setLoading(true)
    try {
      const { hash } = await writeContract({
        address: SONG_CONTRACT,
        abi: songabi,
        functionName: 'transferOwnership',
        args: [newOwner?.trim() ?? ''],
      })

      await waitForTransaction({
        hash,
      })

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
