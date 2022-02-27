import { AppLayout } from '@/components/AppLayout'
import { SongADay__factory } from '@/types'
import { BATCH_IDS, BATCH_OWNERS, SONG_CONTRACT } from '@/utils/constants'
import { useTypedContract, useWriteContract } from '@raidguild/quiver'
import { Button } from '@chakra-ui/button'
import { Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import { Table, Thead, Tr, Td, Th, Tbody } from '@chakra-ui/react'
import { BigNumber } from 'ethers'
import { useState } from 'react'
import toast from 'react-hot-toast'

const BatchMint = () => {
  const { contract: songContract } = useTypedContract(
    SONG_CONTRACT,
    SongADay__factory
  )
  const [loading, setLoading] = useState(false)

  const handleConfirm = () => {
    toast.success('Songs Minted')
  }
  const handleError = (error: any) => {
    console.log(error)
    toast.error(error.error?.message || error.message)
  }
  const handleResponse = () => toast.success('Waiting for tx to confirm')

  const { mutate: batchMint } = useWriteContract(songContract, 'batchMint', {
    onError: handleError,
    onResponse: handleResponse,
    onConfirmation: handleConfirm,
  })

  const batchMintHandler = async () => {
    try {
      setLoading(true)
      await batchMint(
        BATCH_IDS.map((id) => id - 731),
        BATCH_OWNERS,
        {
          gasLimit: BigNumber.from('5000000'),
        }
      )
    } catch (error) {
      console.log(error)
      toast.error((error as any).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing="6">
      <Stack>
        <Heading>Batch Mint</Heading>
        <Text>
          This is a one time action only. Please make sure you are connected to
          the DAO wallet. This will mint all the songs and transfer it to the
          respective owners.
        </Text>
        <Text>
          If you have batch minted before, do not mint again, you will end up
          spending extra gas!
        </Text>
        <Stack spacing="6">
          <Wrap>
            <Button
              loadingText="Minting"
              isLoading={loading}
              disabled={loading}
              onClick={() => batchMintHandler()}
            >
              Batch Mint
            </Button>
          </Wrap>
          <Wrap>
            <Table w="50%" size="sm">
              <Thead>
                <Tr>
                  <Th>Song #</Th>
                  <Th>Address</Th>
                </Tr>
              </Thead>
              <Tbody>
                {BATCH_IDS.map((id, index) => (
                  <Tr key={id}>
                    <Td>{id}</Td>
                    <Td>{BATCH_OWNERS[index]}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Wrap>
        </Stack>
      </Stack>
    </Stack>
  )
}

BatchMint.Layout = AppLayout
export default BatchMint
