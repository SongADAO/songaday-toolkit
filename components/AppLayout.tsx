import { ConnectWallet } from '@/components/ConnectWallet'
import { ROUTES } from '@/utils/constants'
import { Box, Heading, HStack, Spacer } from '@chakra-ui/layout'
import { Button } from '@chakra-ui/button'
import { Link as NextLink } from '@chakra-ui/next-js'
import { useState, useEffect } from 'react'

export const AppLayout = ({ children }) => {
  const [notificationsAllowed, setNotificationsAllowed] = useState(false)

  function requestPermissions() {
    Notification.requestPermission().then((permission) => {
      console.log(permission)
      setNotificationsAllowed(permission === 'granted' ? true : false)
    })
  }

  useEffect(() => {
    requestPermissions()
  }, [])

  return (
    <div>
      <header>
        {!notificationsAllowed && (
          <Box textAlign="center" bg="#e5e5e5" p={2}>
            Notifications are not enabled.{' '}
            <Button onClick={requestPermissions} size="sm">
              Enable
            </Button>
          </Box>
        )}
        <HStack p="4" borderBottom="1px" boxShadow="lg" alignItems="center">
          <NextLink href="/" display="block">
            <Heading
              h="full"
              size="md"
              display="block"
              alignSelf="flex-start"
              mr="8"
            >
              SongADay ToolKit
            </Heading>
          </NextLink>
          <Spacer />
          <HStack spacing="8" justifyContent="flex-start">
            {ROUTES.map((route) => (
              <NextLink key={route.path} href={route.path} display="block">
                {route.name}
              </NextLink>
            ))}
          </HStack>
          <Spacer />
          <ConnectWallet />
        </HStack>
      </header>
      <Box as="main" p="4">
        {children}
      </Box>
    </div>
  )
}
