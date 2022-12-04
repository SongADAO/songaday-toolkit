import { AppLayout } from '@/components/AppLayout'
import fetchJson from '@/utils/fetchJson'
import { Button } from '@chakra-ui/button'
import {
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
} from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Heading, Stack, Flex, Text, Wrap } from '@chakra-ui/layout'
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/number-input'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Textarea } from '@chakra-ui/textarea'
import { DateTime } from 'luxon'
import { FileUpload } from '@/components/FileUpload'
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
  layer: {
    location: string
    topic: string
    instrument: string
    mood: string
    beard: string
  }
  customImage: FileList
}

export const CreateImage = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Attributes>({
    defaultValues: {
      layer: {
        location: '0',
        topic: '1',
        mood: '3',
        beard: '2',
        instrument: '4',
      },
    },
  })

  const selectedImageFile = watch('customImage')
  const [loading, setLoading] = useState(false)

  const [generatedImage, setGeneratedImage] = useState<string>()
  const onSubmit = async (data: Attributes) => {
    setGeneratedImage(undefined)
    setLoading(true)
    try {
      const formdata = new FormData()
      formdata.append('file', data.customImage[0])
      formdata.append('data', JSON.stringify(data))
      const response = await fetchJson<{ image: string }>(
        '/api/generate-image',
        {
          method: 'POST',
          body: formdata,
        }
      )

      console.log({ response })
      setGeneratedImage(response.image)
    } catch (error) {
      console.log({ error })
      toast.error((error as any).response.error)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoFill = (value: string) => {
    try {
      const attributes = value.split('	')
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
      setValue('description', attributes[21])
    } catch (error) {
      console.log({ error })
      toast.error('Number of columns incorrect')
    }
  }
  return (
    <Stack spacing="6">
      <Stack>
        <Heading>Add Attributes</Heading>
        <Text>
          Enter attributes for the song, define the order against it, the base
          layer starts with 0, layer on top of base is 1 and so on. Currently no
          validation is done on the form, make sure the attribute values are
          correct.
        </Text>
        <FormControl isRequired>
          <FormLabel>Auto Fill</FormLabel>
          <Textarea
            onChange={(e) => handleAutoFill(e.target.value)}
            placeholder={`4749	1/1/2022	It's Not FUD, It's Your Feelings	Hartford, CT Studio 2	Ethereum	Synths	Synths	Drum Machine	Pleading	Beard	Electro	Wistful, Dark, Groovy	Wistful	Dark, Groovy			1:02	B	95	https://youtu.be/tBLKuj8PqQo	Background, Location, Topic, Beard, Mood, Instrument	Happy new year! What are we really saying when we say "NO FUD!"?Fear, uncertainty, doubt - these are a fundemental part of the human condition. Repress that shit at your peril. Let's feel our feelings this year!`}
          />
        </FormControl>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing="6">
            <Stack spacing="4">
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Song #</FormLabel>

                    <Input
                      placeholder="4384"
                      type="text"
                      {...register('songNbr', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Date</FormLabel>
                    <Input
                      type="date"
                      {...register('date', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                      type="text"
                      placeholder="Songs, The Hat"
                      {...register('title', { required: true })}
                    />
                  </FormControl>
                </Box>
              </Wrap>
              <Box>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Description of the song"
                    {...register('description')}
                  />
                </FormControl>
              </Box>
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input
                      placeholder="Hartford, CT Studio 2"
                      type="text"
                      {...register('location', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Layer Order</FormLabel>
                    <NumberInput w="28">
                      <NumberInputField
                        {...register('layer.location', { required: true })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </Box>
              </Wrap>
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Topic</FormLabel>
                    <Input
                      placeholder="Life"
                      type="text"
                      {...register('topic', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Layer Order</FormLabel>
                    <NumberInput w="28">
                      <NumberInputField
                        {...register('layer.topic', { required: true })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </Box>
              </Wrap>

              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Mood</FormLabel>
                    <Input
                      placeholder="Chill"
                      type="text"
                      {...register('mood', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Layer Order</FormLabel>
                    <NumberInput w="28">
                      <NumberInputField
                        {...register('layer.mood', { required: true })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </Box>
              </Wrap>

              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Main Instrument</FormLabel>
                    <Input
                      placeholder="Guitalele"
                      type="text"
                      {...register('instrument', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Layer Order</FormLabel>
                    <NumberInput w="28">
                      <NumberInputField
                        {...register('layer.instrument', { required: true })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel>Other Instruments</FormLabel>
                    <Input
                      placeholder="Electric Guitar, Synths, Drums"
                      type="text"
                      {...register('otherInstruments')}
                    />
                  </FormControl>
                </Box>
              </Wrap>
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Beard</FormLabel>
                    <Input
                      placeholder="Shadow"
                      type="text"
                      {...register('beard', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Layer Order</FormLabel>
                    <NumberInput w="28">
                      <NumberInputField
                        {...register('layer.beard', { required: true })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </Box>
              </Wrap>
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Genre</FormLabel>
                    <Input
                      placeholder="Folk"
                      type="text"
                      {...register('genre', { required: true })}
                    />
                  </FormControl>
                </Box>
              </Wrap>
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Main Style</FormLabel>
                    <Input
                      placeholder="Fun"
                      type="text"
                      {...register('style', { required: true })}
                    />
                  </FormControl>
                </Box>

                <Box>
                  <FormControl>
                    <FormLabel>Other Styles</FormLabel>
                    <Input
                      placeholder="Groovy, Anthem, Wistful"
                      type="text"
                      {...register('otherStyles')}
                    />
                  </FormControl>
                </Box>
              </Wrap>
              <Wrap>
                <Box>
                  <FormControl>
                    <FormLabel>Noun</FormLabel>
                    <Input
                      placeholder="Hats"
                      type="text"
                      {...register('noun')}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel>Proper Noun</FormLabel>
                    <Input
                      placeholder="Grogu, Baby Yoda"
                      type="text"
                      {...register('properNoun')}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Video URL</FormLabel>
                    <Input
                      placeholder="https://youtu.be/RmVC1kAbKC8"
                      type="text"
                      {...register('videoUrl', { required: true })}
                    />
                  </FormControl>
                </Box>
              </Wrap>
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Length</FormLabel>
                    <Input
                      placeholder="3:38"
                      type="text"
                      {...register('length', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>InKey</FormLabel>
                    <Input
                      placeholder="C"
                      type="text"
                      {...register('inKey', { required: true })}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Tempo</FormLabel>
                    <Input
                      placeholder="61"
                      type="text"
                      {...register('tempo', { required: true })}
                    />
                  </FormControl>
                </Box>
              </Wrap>
            </Stack>
            <Stack>
              <Wrap>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Custom Image</FormLabel>
                    <FileUpload
                      accept={'image/*'}
                      register={register('customImage')}
                    >
                      <Button leftIcon={<Icon as={FiFile} />}>Upload</Button>
                    </FileUpload>
                    {selectedImageFile?.length > 0 && (
                      <FormHelperText>
                        <Flex alignItems="center">
                          {selectedImageFile?.[0]?.name}
                        </Flex>
                      </FormHelperText>
                    )}

                    <FormErrorMessage>
                      {errors.customImage && errors?.customImage.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </Wrap>
            </Stack>

            <Stack>
              <Text>
                Note 1: If you are not using custom image, make sure you have a
                layers folder in the same directory as this application with all
                the layer files, and an output folder where the image will be
                saved.
              </Text>
            </Stack>
            <Wrap>
              <Button
                loadingText="Generating"
                isLoading={loading}
                disabled={loading}
                onClick={handleSubmit(onSubmit)}
              >
                Generate Image and Metadata
              </Button>
            </Wrap>
            <Stack>
              {generatedImage && (
                <>
                  <img src={generatedImage} alt="Generated" />{' '}
                  <Text>Next Steps:</Text>
                  <Text>
                    1. If the image is wrongly generated, either there is a bug
                    in the code, or you did not enter the attributes correctly.
                    Please fix it and generate it again.
                  </Text>
                  <Text>
                    2. Your image and the the song attributes json will be saved
                    in the output folder. You will need this in the next step to
                    upload the image to IPFS (nft.storage)
                  </Text>
                </>
              )}
            </Stack>
          </Stack>
        </form>
        <Wrap></Wrap>
      </Stack>
    </Stack>
  )
}

CreateImage.Layout = AppLayout
export default CreateImage
