import { AppLayout } from '@/components/AppLayout'
import { Card } from '@/components/Card'
import { ROUTES } from '@/utils/constants'
import { Heading, Stack, Text } from '@chakra-ui/layout'
import { Link as NextLink } from '@chakra-ui/next-js'

export default function Home() {
  return (
    <Stack spacing="6">
      {ROUTES.map((route) => (
        <NextLink key={route.path} href={route.path}>
          <Card>
            <Heading size="md">{route.name}</Heading>
            <Text>{route.description}</Text>
          </Card>
        </NextLink>
      ))}
    </Stack>
  )
}

Home.Layout = AppLayout
