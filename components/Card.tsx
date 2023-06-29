import { Box } from '@chakra-ui/layout'
import { FC } from 'react'

// Card built with Chakra Ui
export const Card = ({ children }) => {
  return (
    <Box
      borderWidth="1px"
      overflow="hidden"
      shadow="md"
      p="4"
      borderColor="black"
    >
      {children}
    </Box>
  )
}
