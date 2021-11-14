import App from 'next/app'
import { FC } from 'react'
import { SWRConfig } from 'swr'
import { Toaster } from 'react-hot-toast'
import type { AppContext, AppProps } from 'next/app'
import { theme } from '@/utils/theme'
import { ChakraProvider } from '@chakra-ui/react'
import '@fontsource/inter/100.css'
import '@fontsource/inter/200.css'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/inter/900.css'
import { WalletProvider } from '@/web3/WalletContext'

const Noop: FC = ({ children }) => <>{children}</>
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function MyApp({ Component, pageProps }: AppProps) {
  // @ts-ignore - Diff to add type of Layout in Component
  const Layout = Component.Layout || Noop
  return (
    <SWRConfig
      value={{
        fetcher: fetch,
        shouldRetryOnError: false,
        revalidateOnFocus: false,
      }}
    >
      <WalletProvider>
        <ChakraProvider theme={theme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
        <Toaster position="bottom-center" />
      </WalletProvider>
    </SWRConfig>
  )
}

/**
 * DO NOT REMOVE THIS
 * We use runtime variables and to use that we need to disable Automatic Static Optimisation
 * https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
 */
MyApp.getInitialProps = async (appContext: AppContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext)

  return { ...appProps }
}

export default MyApp
