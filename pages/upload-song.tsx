import { AppLayout } from '@/components/AppLayout'
import { FileUpload } from '@/components/FileUpload'
import fetchJson from '@/utils/fetchJson'
import {
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Box,
  Heading,
  Stack,
  Flex,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { DateTime } from 'luxon'
import { Icon } from '@chakra-ui/react'
import { FiFile } from 'react-icons/fi'

type Attributes = {
  songNbr: string
  description?: string
  date: string
  title: string
  location: string
  topic: string
  instrument: string
  otherInstruments?: string
  mood: string
  beard: string
  genre: string
  style: string
  otherStyles?: string
  noun?: string
  properNoun?: string
  length: string
  tempo: string
  inKey: string
  videoUrl: string
  videoFile: FileList
  lyrics?: string
}

export const UploadSong = () => {
  const { register, handleSubmit, setValue, watch } = useForm<Attributes>()
  const selectedVideoFile = watch('videoFile')
  const [loading, setLoading] = useState(false)
  const [processedData, setProcessedData] = useState<{
    localVideoPath?: string
    localAudioPath?: string
    localImagePath?: string
    metadata?: any
  }>()

  const handleAutoFill = (value: string) => {
    try {
      const attributes = value.split('\t')
      setValue('songNbr', attributes[0])
      setValue(
        'date',
        DateTime.fromFormat(attributes[1], 'M/d/yyyy').toFormat('yyyy-MM-dd')
      )
      setValue('title', attributes[2])
      setValue('location', attributes[3])
      setValue('topic', attributes[4])
      setValue('instrument', attributes[6])
      setValue('otherInstruments', attributes[7])
      setValue('mood', attributes[8])
      setValue('beard', attributes[9])
      setValue('genre', attributes[10])
      setValue('style', attributes[12])
      setValue('otherStyles', attributes[13])
      setValue('noun', attributes[14])
      setValue('properNoun', attributes[15])
      setValue('length', attributes[16])
      setValue('inKey', attributes[17])
      setValue('tempo', attributes[18])
      setValue('videoUrl', attributes[19])
      setValue('lyrics', attributes[20])
      setValue('description', attributes[21])
    } catch (error) {
      console.log({ error })
      toast.error('Number of columns incorrect')
    }
  }

  const onSubmit = async (data: Attributes) => {
    setLoading(true)
    try {
      const formdata = new FormData()
      formdata.append('file', data.videoFile[0])
      formdata.append('data', JSON.stringify(data))
      
      const response = await fetchJson<{ 
        localVideoPath: string
        localAudioPath: string
        localImagePath: string
        metadata: any
      }>('/api/process-video', {
        method: 'POST',
        body: formdata,
      })

      setProcessedData(response)
      toast.success('Video processed successfully!')
    } catch (error) {
      console.log({ error })
      toast.error((error as any).response.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <Stack spacing="6">
        <Heading>Upload Song</Heading>
        
        {/* Auto-fill from spreadsheet */}
        <Box>
          <FormControl>
            <FormLabel>Auto Fill</FormLabel>
            <Textarea
              placeholder="Paste spreadsheet row here"
              onChange={(e) => handleAutoFill(e.target.value)}
            />
          </FormControl>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing="4">
            <Box>
              <FormControl isRequired>
                <FormLabel>Song Number</FormLabel>
                <Input {...register('songNbr', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input type="date" {...register('date', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input {...register('title', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input {...register('location', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Topic</FormLabel>
                <Input {...register('topic', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Main Instrument</FormLabel>
                <Input {...register('instrument', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Other Instruments</FormLabel>
                <Input {...register('otherInstruments')} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Mood</FormLabel>
                <Input {...register('mood', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Beard</FormLabel>
                <Input {...register('beard', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Genre</FormLabel>
                <Input {...register('genre', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Style</FormLabel>
                <Input {...register('style', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Other Styles</FormLabel>
                <Input {...register('otherStyles')} />
              </FormControl>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Noun</FormLabel>
                <Input {...register('noun')} />
              </FormControl>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Proper Noun</FormLabel>
                <Input {...register('properNoun')} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Length</FormLabel>
                <Input {...register('length', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Key</FormLabel>
                <Input {...register('inKey', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Tempo</FormLabel>
                <Input {...register('tempo', { required: true })} />
              </FormControl>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Video URL</FormLabel>
                <Input {...register('videoUrl')} />
              </FormControl>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Lyrics</FormLabel>
                <Textarea {...register('lyrics')} />
              </FormControl>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea {...register('description')} />
              </FormControl>
            </Box>

            <Box>
              <FormControl isRequired>
                <FormLabel>Video File</FormLabel>
                <FileUpload
                  accept={'video/*'}
                  register={register('videoFile', { required: true })}
                >
                  <Button leftIcon={<Icon as={FiFile} />}>Upload Video</Button>
                </FileUpload>
                {selectedVideoFile?.length > 0 && (
                  <FormHelperText>
                    <Flex alignItems="center">
                      {selectedVideoFile?.[0]?.name}
                    </Flex>
                  </FormHelperText>
                )}
              </FormControl>
            </Box>

            <Button
              mt={4}
              loadingText="Processing"
              isLoading={loading}
              disabled={loading}
              type="submit"
            >
              Process Video
            </Button>
          </Stack>
        </form>

        {processedData && (
          <Stack>
            <Text>Video processed successfully!</Text>
            <Text>Saved to: {processedData.localVideoPath}</Text>
            <Text>Audio extracted to: {processedData.localAudioPath}</Text>
            <Text>Screenshot saved to: {processedData.localImagePath}</Text>
          </Stack>
        )}
      </Stack>
    </AppLayout>
  )
}

export default UploadSong 