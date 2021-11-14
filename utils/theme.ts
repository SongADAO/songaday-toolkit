import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react'

const colors = {
  main: {
    black: '#12111E',
    white: '#fff',
  },
}

const Button = {
  variants: {
    outline: {
      borderRadius: 'none',
      color: 'black',
    },
  },
  defaultProps: {
    variant: 'outline',
  },
}

const Heading = {
  defaultProps: {
    size: 'md',
  },
}

const Input = {
  variants: {
    outline: {
      field: {
        borderRadius: 'none',
        borderColor: 'black',
      },
    },
  },
}

const NumberInput = {
  variants: {
    outline: {
      field: {
        borderRadius: 'none',
        borderColor: 'black',
      },
      stepper: {
        borderColor: 'black',
      },
    },
  },
}

export const theme = extendTheme(
  {
    colors,
    components: {
      Button,
      Heading,
      Input,
      NumberInput,
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  withDefaultColorScheme({
    colorScheme: 'primary',
  })
)
