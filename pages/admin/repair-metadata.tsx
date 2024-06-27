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
import { writeContract, waitForTransaction } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { songabi } from '@/utils/abi/songabi'

const RepairMetadata = () => {
  const [loading, setLoading] = useState(false)
  const { isConnected } = useAccount()
  const [ipfsHashes, setIpfsHashes] = useState('')
  const [songNbrs, setSongNbrs] = useState<string>()

  const repairMetadata = async () => {
    setLoading(true)

    if (!songNbrs || !ipfsHashes) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const { hash } = await writeContract({
        abi: songabi,
        functionName: 'repairMetadata',
        address: SONG_CONTRACT,
        args: [
          songNbrs
            .split(',')
            .map((nbrstr) => nbrstr.trim())
            .map(Number),
          ipfsHashes.split(',').map((hash) => hash.trim()),
        ],
      })

      await waitForTransaction({ hash })

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
