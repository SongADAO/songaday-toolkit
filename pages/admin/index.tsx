import { AppLayout } from '@/components/AppLayout'
import { Card } from '@/components/Card'
import { ADMIN_ROUTES } from '@/utils/constants'
import { Heading, Link, Stack, Text } from '@chakra-ui/layout'
import { Link as NextLink } from '@chakra-ui/next-js'

export default function Admin() {
  return (
    <Stack spacing="6">
      {ADMIN_ROUTES.map((route) => (
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

Admin.Layout = AppLayout
