import { AppLayout } from '@/components/AppLayout'
import { SongADay, SongADay__factory } from '@/types'
import { SONG_CONTRACT } from '@/utils/constants'
import { useContract, useReadContract } from '@/web3/hooks'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import { useState } from 'react'
import toast from 'react-hot-toast'

const FindOwner = () => {
  const [songNbr, setSongNbr] = useState<string>()
  const [tokenOwner, setTokenOwner] = useState<string>()
  const { contract: songContract } = useContract(
    SONG_CONTRACT,
    SongADay__factory,
    { useStaticProvider: true }
  )

  const { response: contractOwner } = useReadContract(songContract, 'owner')

  const tokenOwnerHandler = async () => {
    setTokenOwner(undefined)
    try {
      const tokenOwner = await (songContract as SongADay)?.ownerOf(
        songNbr?.trim() ?? ''
      )
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
