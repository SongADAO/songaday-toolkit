import { ConnectWallet } from '@/components/ConnectWallet'
import { ROUTES } from '@/utils/constants'
import { Box, Heading, HStack, Link, Spacer } from '@chakra-ui/layout'
import NextLink from 'next/link'
import { FC } from 'react'
export const AppLayout: FC = ({ children }) => {
  return (
    <div>
      <header>
        <HStack p="4" borderBottom="1px" boxShadow="lg" alignItems="center">
          <NextLink href="/">
            <Link display="block">
              <Heading
                h="full"
                size="md"
                display="block"
                alignSelf="flex-start"
                mr="8"
              >
                SongADay ToolKit
              </Heading>
            </Link>
          </NextLink>
          <Spacer />
          <HStack spacing="8" justifyContent="flex-start">
            {ROUTES.map((route) => (
              <NextLink key={route.path} href={route.path}>
                <Link display="block">{route.name}</Link>
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
