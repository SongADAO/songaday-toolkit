import { AppLayout } from '@/components/AppLayout'
import { FileUpload } from '@/components/FileUpload'
import fetchJson from '@/utils/fetchJson'
import { Button } from '@chakra-ui/button'
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from '@chakra-ui/form-control'
import Icon from '@chakra-ui/icon'
import { Input } from '@chakra-ui/input'
import { Box, Flex, Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { FiFile } from 'react-icons/fi'
import { HiX } from 'react-icons/hi'

type FormValues = {
  file_: FileList
}

type MetadataValues = FormValues & {
  imageHash: string
  videoHash: string
  audioHash: string
}

export const Upload = () => {
  const router = useRouter()

  // IMAGE
  const {
    register: registerImage,
    handleSubmit: handleSubmitImage,
    formState: { errors: errorsImage },
    watch: watchImage,
  } = useForm<FormValues>({})

  const selectedImageFile = watchImage('file_')
  const [loadingImage, setLoadingImage] = useState(false)
  const [imageHash, setImageHash] = useState<string>()
  const [songNbr, setSongNbr] = useState<string>()

  // VIDEO
  const {
    register: registerVideo,
    handleSubmit: handleSubmitVideo,
    formState: { errors: errorsVideo },
    watch: watchVideo,
  } = useForm<FormValues>({})

  const selectedVideoFile = watchVideo('file_')
  const [loadingVideo, setLoadingVideo] = useState(false)
  const [videoHash, setVideoHash] = useState<string>()

  // AUDIO
  const {
    register: registerAudio,
    handleSubmit: handleSubmitAudio,
    formState: { errors: errorsAudio },
    watch: watchAudio,
  } = useForm<FormValues>({})

  const selectedAudioFile = watchAudio('file_')
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [audioHash, setAudioHash] = useState<string>()

  // Metadata
  const {
    register: registerMetadata,
    handleSubmit: handleSubmitMetadata,
    formState: { errors: errorsAttributes },
    watch: watchMetadata,
    setValue: setValueMetadata,
  } = useForm<MetadataValues>({})

  const selectedAttributesFile = watchMetadata('file_')
  const [loadingMetadata, setLoadingMetadata] = useState(false)
  const [metadataHash, setMetadataHash] = useState<string>()

  const onSubmitImage = async (data: FormValues) => {
    if (!songNbr) {
      toast.error('Please enter a song number')
      return
    }
    setImageHash(undefined)
    setLoadingImage(true)
    try {
      const formdata = new FormData()
      formdata.append('file', data.file_[0])
      formdata.append('songNbr', songNbr)

      const response = await fetchJson<{ hash: string }>('/api/upload-image', {
        method: 'POST',
        body: formdata,
      })
      setImageHash(response.hash)
    } catch (error) {
      console.log({ error })
      toast.error((error as any).response.error)
    } finally {
      setLoadingImage(false)
    }
  }

  const onSubmitVideo = async (data: FormValues) => {
    if (!songNbr) {
      toast.error('Please enter a song number')
      return
    }
    setVideoHash(undefined)
    setLoadingVideo(true)
    try {
      const formdata = new FormData()
      formdata.append('file', data.file_[0])
      formdata.append('songNbr', songNbr)

      const response = await fetchJson<{ hash: string }>('/api/upload-video', {
        method: 'POST',
        body: formdata,
      })
      setVideoHash(response.hash)
    } catch (error) {
      console.log({ error })
      toast.error((error as any).response.error)
    } finally {
      setLoadingVideo(false)
    }
  }

  const onSubmitAudio = async (data: FormValues) => {
    if (!songNbr) {
      toast.error('Please enter a song number')
      return
    }
    setAudioHash(undefined)
    setLoadingAudio(true)
    try {
      const formdata = new FormData()
      formdata.append('file', data.file_[0])
      formdata.append('songNbr', songNbr)

      const response = await fetchJson<{ hash: string }>('/api/upload-audio', {
        method: 'POST',
        body: formdata,
      })
      setAudioHash(response.hash)
    } catch (error) {
      console.log({ error })
      toast.error((error as any).response.error)
    } finally {
      setLoadingAudio(false)
    }
  }

  const onSubmitMetadata = async (data: MetadataValues) => {
    if (!songNbr) {
      toast.error('Please enter a song number')
      return
    }
    setMetadataHash(undefined)
    setLoadingMetadata(true)
    try {
      const formdata = new FormData()
      formdata.append('file', data.file_[0])
      formdata.append('songNbr', songNbr)
      formdata.append('imageHash', data.imageHash)
      formdata.append('videoHash', data.videoHash)
      formdata.append('audioHash', data.audioHash)

      const response = await fetchJson<{ hash: string }>(
        '/api/upload-metadata',
        {
          method: 'POST',
          body: formdata,
        }
      )
      setMetadataHash(response.hash)
    } catch (error) {
      console.log({ error })
      toast.error((error as any).response.error)
    } finally {
      setLoadingMetadata(false)
    }
  }

  return (
    <Stack spacing="6">
      <Wrap>
        <Box>
          <FormControl isRequired>
            <FormLabel>Song Number</FormLabel>
            <Input
              placeholder="Song Number"
              type="text"
              value={songNbr}
              onChange={(e) => setSongNbr(e.target.value)}
            />
          </FormControl>
        </Box>
      </Wrap>
      <Stack>
        <Heading>Upload Image</Heading>
        <Text>
          Select the image from your computer to upload to your nft.storage
          account.
        </Text>
        <form onSubmit={handleSubmitImage(onSubmitImage)}>
          <Stack spacing="6">
            <Stack spacing="4">
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Select Image</FormLabel>
                    <FileUpload
                      accept={'image/*'}
                      register={registerImage('file_')}
                    >
                      <Button leftIcon={<Icon as={FiFile} />}>Upload</Button>
                    </FileUpload>
                    {selectedImageFile?.length > 0 && (
                      <FormHelperText>
                        <Flex alignItems="center">
                          {selectedImageFile?.[0]?.name}
                          <Box ml="1" onClick={() => router.reload()}>
                            <HiX></HiX>
                          </Box>
                        </Flex>
                      </FormHelperText>
                    )}

                    <FormErrorMessage>
                      {errorsImage.file_ && errorsImage?.file_.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </Wrap>
            </Stack>
            <Wrap>
              <Button
                loadingText="Uploading"
                isLoading={loadingImage}
                disabled={loadingImage}
                onClick={handleSubmitImage(onSubmitImage)}
              >
                Upload Image to IPFS
              </Button>
            </Wrap>
            <Stack>
              {imageHash && (
                <>
                  <Text>
                    Image Hash: {imageHash}{' '}
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(imageHash)
                        setValueMetadata('imageHash', imageHash)
                      }}
                      size="sm"
                    >
                      Copy
                    </Button>
                  </Text>
                  <Text>Next Steps:</Text>
                  <Text>
                    1. You might want to copy this hash, though the hash is also
                    stored in the output directory so its okay if you dont copy.
                    You will need this hash when you are ready to upload the
                    song metadata.
                  </Text>
                  <Text>2. Upload the video to nft.storage.</Text>
                </>
              )}
            </Stack>
          </Stack>
        </form>
      </Stack>
      <Stack>
        <Heading>Upload Video</Heading>
        <Text>
          Select the video from your computer to upload to your nft.storage
          account.
        </Text>
        <form onSubmit={handleSubmitVideo(onSubmitVideo)}>
          <Stack spacing="6">
            <Stack spacing="4">
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Select Video</FormLabel>
                    <FileUpload
                      accept={'video/*'}
                      register={registerVideo('file_')}
                    >
                      <Button leftIcon={<Icon as={FiFile} />}>Upload</Button>
                    </FileUpload>
                    {selectedVideoFile?.length > 0 && (
                      <FormHelperText>
                        <Flex alignItems="center">
                          {selectedVideoFile?.[0]?.name}
                          <Box ml="1" onClick={() => router.reload()}>
                            <HiX></HiX>
                          </Box>
                        </Flex>
                      </FormHelperText>
                    )}

                    <FormErrorMessage>
                      {errorsVideo.file_ && errorsVideo?.file_.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </Wrap>
            </Stack>
            <Wrap>
              <Button
                loadingText="Uploading"
                isLoading={loadingVideo}
                disabled={loadingVideo}
                onClick={handleSubmitVideo(onSubmitVideo)}
              >
                Upload Video to IPFS
              </Button>
            </Wrap>
            <Stack>
              {videoHash && (
                <>
                  <Text>
                    Video Hash: {videoHash}{' '}
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(videoHash)
                        setValueMetadata('videoHash', videoHash)
                      }}
                      size="sm"
                    >
                      Copy
                    </Button>
                  </Text>
                  <Text>Next Steps:</Text>
                  <Text>
                    1. You might want to copy this hash, though the hash is also
                    stored in the output directory so its okay if you dont copy.
                    You will need this hash when you are ready to upload the
                    song metadata.
                  </Text>
                  <Text>2. Upload the song metadata to nft.storage.</Text>
                </>
              )}
            </Stack>
          </Stack>
        </form>
      </Stack>
      <Stack>
        <Heading>Upload Audio</Heading>
        <Text>
          Select the audio from your computer to upload to your nft.storage
          account.
        </Text>
        <form onSubmit={handleSubmitAudio(onSubmitAudio)}>
          <Stack spacing="6">
            <Stack spacing="4">
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Select Audio</FormLabel>
                    <FileUpload
                      accept={'audio/*'}
                      register={registerAudio('file_')}
                    >
                      <Button leftIcon={<Icon as={FiFile} />}>Upload</Button>
                    </FileUpload>
                    {selectedAudioFile?.length > 0 && (
                      <FormHelperText>
                        <Flex alignItems="center">
                          {selectedAudioFile?.[0]?.name}
                          <Box ml="1" onClick={() => router.reload()}>
                            <HiX></HiX>
                          </Box>
                        </Flex>
                      </FormHelperText>
                    )}

                    <FormErrorMessage>
                      {errorsAudio.file_ && errorsAudio?.file_.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </Wrap>
            </Stack>
            <Wrap>
              <Button
                loadingText="Uploading"
                isLoading={loadingAudio}
                disabled={loadingAudio}
                onClick={handleSubmitAudio(onSubmitAudio)}
              >
                Upload Audio to IPFS
              </Button>
            </Wrap>
            <Stack>
              {audioHash && (
                <>
                  <Text>
                    Audio Hash: {audioHash}{' '}
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(audioHash)
                        setValueMetadata('audioHash', audioHash)
                      }}
                      size="sm"
                    >
                      Copy
                    </Button>
                  </Text>
                  <Text>Next Steps:</Text>
                  <Text>
                    1. You might want to copy this hash, though the hash is also
                    stored in the output directory so its okay if you dont copy.
                    You will need this hash when you are ready to upload the
                    song metadata.
                  </Text>
                  <Text>2. Upload the song metadata to nft.storage.</Text>
                </>
              )}
            </Stack>
          </Stack>
        </form>
      </Stack>
      <Stack>
        <Heading>Generate and Upload Song Metadata</Heading>
        <Text>
          Provide your image, video hash, audio hash, and song attributes.json
          to generate a metadata and upload it to nft.storage.
        </Text>
        <form onSubmit={handleSubmitMetadata(onSubmitMetadata)}>
          <Stack spacing="6">
            <Stack spacing="4">
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Image Hash</FormLabel>
                    <Input
                      placeholder="Image Hash"
                      type="text"
                      {...registerMetadata('imageHash', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Video Hash</FormLabel>
                    <Input
                      placeholder="Video Hash"
                      type="text"
                      {...registerMetadata('videoHash', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Audio Hash</FormLabel>
                    <Input
                      placeholder="Audio Hash"
                      type="text"
                      {...registerMetadata('audioHash', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Upload Attributes</FormLabel>
                    <FileUpload
                      accept={'.json'}
                      register={registerMetadata('file_')}
                    >
                      <Button leftIcon={<Icon as={FiFile} />}>Upload</Button>
                    </FileUpload>
                    {selectedAttributesFile?.length > 0 && (
                      <FormHelperText>
                        <Flex alignItems="center">
                          {selectedAttributesFile?.[0]?.name}
                          <Box ml="1" onClick={() => router.reload()}>
                            <HiX></HiX>
                          </Box>
                        </Flex>
                      </FormHelperText>
                    )}

                    <FormErrorMessage>
                      {errorsAttributes.file_ &&
                        errorsAttributes?.file_.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </Wrap>
            </Stack>
            <Wrap>
              <Button
                loadingText="Working"
                isLoading={loadingMetadata}
                disabled={loadingMetadata}
                onClick={handleSubmitMetadata(onSubmitMetadata)}
              >
                Upload Metadata to IPFS
              </Button>
            </Wrap>
            <Stack>
              {metadataHash && (
                <>
                  <Text>
                    Metadata Hash: {metadataHash}{' '}
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(metadataHash)
                      }}
                      size="sm"
                    >
                      Copy
                    </Button>
                  </Text>
                  <Text>Next Steps:</Text>
                  <Text>
                    1. You might want to copy this hash, though the hash is also
                    stored in the output directory so its okay if you dont copy.
                    You will need this hash to start an auction.
                  </Text>
                  <Text>2. Auction the song.</Text>
                </>
              )}
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Stack>
  )
}

Upload.Layout = AppLayout
export default Upload
