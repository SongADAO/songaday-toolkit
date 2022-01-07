import { Button } from '@chakra-ui/button'
import { Box, Flex, HStack, Text } from '@chakra-ui/layout'
import { FC } from 'react'
import { HiX } from 'react-icons/hi'

import { useWallet } from '@raidguild/quiver'
import { formatAddress } from '@raidguild/quiver'

export const ConnectWallet: FC = () => {
  const { connectWallet, isConnecting, isConnected, disconnect, address } =
    useWallet()
  return (
    <>
      {!isConnected && (
        <Button
          disabled={isConnecting}
          onClick={() => !isConnected && connectWallet()}
        >
          {isConnecting
            ? 'Connecting...'
            : isConnected
            ? 'Connected'
            : 'Connect Wallet'}
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
