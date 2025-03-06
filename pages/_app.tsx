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
import { EthereumClient } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { wagmiConfig, chains, walletConnectProjectId } from '@/utils/wagmi'
import { WagmiProvider } from 'wagmi'

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

  const ethereumClient = new EthereumClient(wagmiConfig, chains)

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
          <ChakraProvider theme={theme}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ChakraProvider>
          <Toaster position="bottom-center" />
        </WagmiProvider>
        <Web3Modal
          projectId={walletConnectProjectId}
          ethereumClient={ethereumClient}
        />
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
