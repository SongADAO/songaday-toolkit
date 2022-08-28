import { AppLayout } from '@/components/AppLayout'
import { SongADay, SongADay__factory } from '@/types'
import { SONG_CONTRACT } from '@/utils/constants'
import { useTypedContract } from '@raidguild/quiver'
import { useWallet } from '@raidguild/quiver'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import { useState } from 'react'
import toast from 'react-hot-toast'

const RepairMetadata = () => {
  const [loading, setLoading] = useState(false)
  const { isConnected } = useWallet()
  const { contract: songContract } = useTypedContract(
    SONG_CONTRACT,
    SongADay__factory
  )
  const [ipfsHashes, setIpfsHashes] = useState('')
  const [songNbrs, setSongNbrs] = useState<string>()

  const repairMetadata = async () => {
    setLoading(true)

    if (!songNbrs || !ipfsHashes) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const tx = await (songContract as SongADay)?.repairMetadata(
        songNbrs
          .split(',')
          .map((nbrstr) => nbrstr.trim())
          .map(Number),
        ipfsHashes.split(',').map((hash) => hash.trim())
      )

      await tx.wait()
      toast.success(`Successfully repaired metadata for song ${songNbrs}`)
    } catch (error) {
      toast.error((error as any).error?.message || (error as any)?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing="6">
      {isConnected && (
        <Stack spacing="6">
          <Stack>
            <Heading>Repair Metadata</Heading>
            <Text>Enter the song the the tokenURI you want to repair.</Text>
            <Stack spacing="6">
              <Stack spacing="4">
                <Wrap>
                  <Box>
                    <FormControl isRequired>
                      <FormLabel>Song Numbers (Comma Separated)</FormLabel>
                      <Input
                        placeholder="4353,4354,4355"
                        type="text"
                        value={songNbrs}
                        onChange={(e) => setSongNbrs(e.target.value)}
                      />
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl isRequired>
                      <FormLabel>New IPFS Hashes (Comma Separated)</FormLabel>
                      <Input
                        placeholder="bafybeibudrscqa46aysruhkbva7kui7xnk77zsrfqcfcey23ufeiy7qcka,bafybeibudrscqa46aysruhkbva7kui7xnk77zsrfqcfcey23ufeiy7qcka,bafybeibudrscqa46aysruhkbva7kui7xnk77zsrfqcfcey23ufeiy7qcka"
                        type="text"
                        value={ipfsHashes}
                        onChange={(e) => setIpfsHashes(e.target.value)}
                      />
                    </FormControl>
                  </Box>
                </Wrap>
              </Stack>
              <Wrap>
                <Button
                  loadingText="Repairing"
                  isLoading={loading}
                  disabled={loading}
                  onClick={() => repairMetadata()}
                >
                  Repair Metadata
                </Button>
              </Wrap>
            </Stack>
          </Stack>
        </Stack>
      )}
      {!isConnected && (
        <Text>
          You need to be connected to the contract owner Wallet to repair the
          metadata. Use the Connect Wallet Button to connect
        </Text>
      )}
    </Stack>
  )
}

RepairMetadata.Layout = AppLayout
export default RepairMetadata
