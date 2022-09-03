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
  const [songNbrs, setSongNbrs] = useState('')
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
    const songNbrsList = songNbrs
      .split(',')
      .map((nbrstr) => nbrstr.trim())
      .map(Number)

    if (songNbrsList.some((s) => !s) || songNbrsList.some((s) => s <= 4748)) {
      toast.error('Please enter songs > 4748')
      return
    }

    try {
      setIndexingSong(true)
      await Promise.all(
        songNbrsList.map((s) => fetchJson(`/api/index-song/?token_id=${s}`))
      )
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
        <Heading>Index Specific Songs</Heading>
        <Text>
          If you recently minted a few songs, you should index them so that they
          show up on explore page.
        </Text>

        <Stack spacing="6">
          <Wrap>
            <Box>
              <FormControl isRequired>
                <FormLabel>Song # (Comma Separated)</FormLabel>
                <Input
                  placeholder="4784,4785,4786"
                  type="text"
                  value={songNbrs}
                  onChange={(e) => setSongNbrs(e.target.value)}
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
