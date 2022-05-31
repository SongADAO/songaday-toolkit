import { AppLayout } from '@/components/AppLayout'
import fetchJson from '@/utils/fetchJson'
import { Button } from '@chakra-ui/button'
import { Heading, Stack, Text, Wrap, Box } from '@chakra-ui/layout'
import { FormControl, FormLabel, Input } from '@chakra-ui/react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const IndexSongs = () => {
  const [indexingAll, setIndexingAll] = useState(false)
  const [indexingSong, setIndexingSong] = useState(false)
  const [songNbr, setSongNbr] = useState('')
  const indexAllSongs = async () => {
    try {
      setIndexingAll(true)
      await fetchJson('/api/index-songs')
    } catch (error) {
      console.log({ error })
    } finally {
      setIndexingAll(false)
    }
  }

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

  return (
    <Stack spacing="6">
      <Stack>
        <Heading>Index All Songs</Heading>
        <Text>
          Index songs (From the drop and songs uptill now) to algolia so that
          explore page works fine
        </Text>

        <Stack spacing="6">
          <Wrap>
            <Button
              loadingText="Indexing"
              isLoading={indexingAll}
              disabled={indexingAll}
              onClick={indexAllSongs}
            >
              Index All
            </Button>
          </Wrap>
        </Stack>
      </Stack>
      <Stack>
        <Heading>Index Specific Song</Heading>
        <Text>
          If you recently minted a new song, you should index it so that it
          shows up on explore page.
        </Text>

        <Stack spacing="6">
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
          <Wrap>
            <Button
              loadingText="Indexing"
              isLoading={indexingSong}
              disabled={indexingSong}
              onClick={indexSong}
            >
              Index Song
            </Button>
          </Wrap>
        </Stack>
      </Stack>
    </Stack>
  )
}

IndexSongs.Layout = AppLayout
export default IndexSongs
