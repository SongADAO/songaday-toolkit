import { AppLayout } from '@/components/AppLayout'
import { FileUpload } from '@/components/FileUpload'
import fetchJson from '@/utils/fetchJson'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Icon,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Papa from 'papaparse'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FiFile } from 'react-icons/fi'
import { HiX } from 'react-icons/hi'

type FormValues = {
  file_: FileList
}

export default function Bulk() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<FormValues>({})

  const router = useRouter()

  const [hash, setHash] = useState<string>()
  const [loading, setLoading] = useState(false)
  const selectedFile = watch('file_')

  const onSubmit = async (data: FormValues) => {
    setHash(undefined)
    setLoading(true)
    try {
      const csv = await new Promise((resolve, reject) => {
        Papa.parse(data.file_[0], {
          header: true,
          complete: (results) => resolve(results.data),
          error: (err) => reject(err),
        })
      })

      const response = await fetchJson<{ hash: string }>('/api/bulk-image', {
        method: 'POST',
        body: JSON.stringify({
          csv,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      setHash(response.hash)
    } catch (error) {
      toast.error('There were errors in your csv')
      setError('file_', { message: (error as any).response.error })
    } finally {
      setLoading(false)
    }
  }

  console.log(errors)

  return (
    <Stack>
      <Heading>Bulk Image Generator</Heading>
      <Text>
        Using a CSV file for a year, this tool will generate all the images of
        the songs for the year
      </Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing="6">
          <Stack spacing="4">
            <Wrap>
              <Box>
                <FormControl isRequired>
                  <FormLabel>Select CSV</FormLabel>
                  <FileUpload accept={'.csv'} register={register('file_')}>
                    <Button leftIcon={<Icon as={FiFile} />}>Upload</Button>
                  </FileUpload>
                  {selectedFile?.length > 0 && (
                    <FormHelperText>
                      <Flex alignItems="center">
                        {selectedFile?.[0]?.name}
                        <Box ml="1" onClick={() => router.reload()}>
                          <HiX></HiX>
                        </Box>
                      </Flex>
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Wrap>
          </Stack>
          <Wrap>
            <Button
              loadingText="Generating"
              isLoading={loading}
              disabled={loading}
              onClick={handleSubmit(onSubmit)}
            >
              Generate Images
            </Button>
          </Wrap>
          <Stack>
            <Text>
              Note 1: The output directory will contain all the images which you
              can upload to IPFS.
            </Text>
          </Stack>
          <Stack as="pre">{errors.file_ && <>{errors.file_.message}</>}</Stack>
        </Stack>
      </form>
    </Stack>
  )
}

Bulk.Layout = AppLayout
