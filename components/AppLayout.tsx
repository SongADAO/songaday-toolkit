import { ConnectWallet } from '@/components/ConnectWallet'
import { ROUTES } from '@/utils/constants'
import { Box, Heading, HStack, Spacer } from '@chakra-ui/layout'
import { Link as NextLink } from '@chakra-ui/next-js'
export const AppLayout = ({ children }) => {
  return (
    <div>
      <header>
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
