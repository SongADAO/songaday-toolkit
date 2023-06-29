import { formatAddress } from '@/utils/helpers'
import { Button } from '@chakra-ui/button'
import { Box, Flex, HStack, Text } from '@chakra-ui/layout'
import { useWeb3Modal } from '@web3modal/react'
import { FC } from 'react'
import { HiX } from 'react-icons/hi'
import { useAccount, useDisconnect } from 'wagmi'

export const ConnectWallet = () => {
  const { open: connectWallet } = useWeb3Modal()
  const { disconnect } = useDisconnect()
  const { isConnected, address } = useAccount()
  return (
    <>
      {!isConnected && (
        <Button onClick={() => !isConnected && connectWallet()}>
          {isConnected ? 'Connected' : 'Connect Wallet'}
        </Button>
      )}
      {isConnected && (
        <Flex align="center">
          <HStack spacing="5">
            <Box display="flex" alignItems="center" justifyContent="center">
              <Box mr="2">
                <Text fontWeight="bold">{formatAddress(address)}</Text>
              </Box>
              <HiX onClick={() => disconnect()} />
            </Box>
          </HStack>
        </Flex>
      )}
    </>
  )
}
