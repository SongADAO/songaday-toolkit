import { AppLayout } from '@/components/AppLayout'
import { songabi } from '@/utils/abi/songabi'
import { SONG_CONTRACT } from '@/utils/constants'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Heading, Stack, Text, Wrap } from '@chakra-ui/layout'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { writeContract, waitForTransaction } from '@wagmi/core'
import { useAccount } from 'wagmi'

const SoundxyzWinners = () => {
  const { isConnected } = useAccount()

  return (
    <Stack spacing="6">
      {isConnected && (
        <Stack>
          <Heading>Sound.xyz Winners</Heading>
        </Stack>
      )}
      {!isConnected && (
        <Text>
          You need to be connected to the DAO's Wallet to view winners. Use the
          Connect Wallet Button to connect
        </Text>
      )}
    </Stack>
  )
}

SoundxyzWinners.Layout = AppLayout
export default SoundxyzWinners
