import App from 'next/app'
import { ReactNode, useEffect, useState } from 'react'
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
import Head from 'next/head'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/utils/wagmi'
import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

const ClientOnly = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  if (!isMounted) {
    return null
  }
  return <>{children}</>
}

const Noop = ({ children }: { children: ReactNode }) => <>{children}</>

function MyApp({ Component, pageProps }: AppProps) {
  // @ts-ignore - Diff to add type of Layout in Component
  const Layout = Component.Layout || Noop

  return (
    <ClientOnly>
      {/** @ts-ignore */}
      <SWRConfig
        value={{
          fetcher: fetch,
          shouldRetryOnError: false,
          revalidateOnFocus: false,
        }}
      >
        <Head>
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <ChakraProvider theme={theme}>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </ChakraProvider>
              <Toaster position="bottom-center" />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </SWRConfig>
    </ClientOnly>
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
