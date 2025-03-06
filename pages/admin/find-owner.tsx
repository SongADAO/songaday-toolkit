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
import toast from 'react-hot-toast'
import { useReadContract } from 'wagmi'
import { readContract } from '@wagmi/core'
import { wagmiConfig as config } from '@/utils/wagmi'

const FindOwner = () => {
  const [songNbr, setSongNbr] = useState<string>('')
  const [tokenOwner, setTokenOwner] = useState<string>('')

  const { data: contractOwner } = useReadContract({
    abi: songabi,
    address: SONG_CONTRACT,
    functionName: 'owner',
  })

  const tokenOwnerHandler = async () => {
    setTokenOwner(undefined)
    try {
      const tokenOwner = await readContract(config, {
        address: SONG_CONTRACT,
        abi: songabi,
        functionName: 'ownerOf',
        args: [BigInt(songNbr?.trim() ?? '')],
      })
      setTokenOwner(tokenOwner)
    } catch (error) {
      toast.error((error as any).error?.message || (error as any)?.message)
    }
  }

  return (
    <Stack spacing="6">
      <Stack>
        <Heading>Find Owner</Heading>
        <Text>
          Find the owner of the song. This is useful to find if the song is
          owned by the treasury.
        </Text>
        <Stack spacing="6">
          <Stack spacing="4">
            <Wrap>
              <Box>
                <FormControl isRequired>
                  <FormLabel>Song #</FormLabel>
                  <Input
                    placeholder="4353"
                    type="text"
                    value={songNbr}
                    onChange={(e) => setSongNbr(e.target.value)}
                  />
                </FormControl>
              </Box>
            </Wrap>
          </Stack>
          <Wrap>
            <Button onClick={() => tokenOwnerHandler()}>Find Owner</Button>
          </Wrap>
          <Stack>
            <Text>{tokenOwner}</Text>
            <Text>
              Note: The contract is currently owned by {contractOwner}
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}

FindOwner.Layout = AppLayout
export default FindOwner
