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
import { NetworkConfig, WalletProvider } from '@raidguild/quiver'
import { IProviderOptions } from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Head from 'next/head'
import { CHAIN_ID } from '@/utils/constants'

const Noop: FC = ({ children }) => <>{children}</>
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function MyApp({ Component, pageProps }: AppProps) {
  // @ts-ignore - Diff to add type of Layout in Component
  const Layout = Component.Layout || Noop

  const networks: NetworkConfig = {
    '0x1': {
      chainId: '0x1',
      name: 'Mainnet',
      symbol: 'ETH',
      explorer: 'https://etherscan.io/tx/',
      rpc: 'https://mainnet.infura.io/v3/60a7b2c16321439a917c9e74a994f7df',
    },
    '0x4': {
      chainId: '0x4',
      name: 'Rinkeby',
      symbol: 'ETH',
      explorer: 'https://rinkeby.etherscan.io/',
      rpc: 'https://rinkeby.infura.io/v3/60a7b2c16321439a917c9e74a994f7df',
    },
    '0x5': {
      chainId: '0x5',
      name: 'Goerli',
      symbol: 'ETH',
      explorer: 'https://goerli.etherscan.io/',
      rpc: 'https://goerli.infura.io/v3/0251872b43d94c17a58a4e5f2591a84a',
    },
    '0x539': {
      chainId: '0x539',
      name: 'Hardhat',
      symbol: 'ETH',
      explorer: 'http://localhost:1234/',
      rpc: 'http://localhost:8545',
    },
  }

  const providerOptions: IProviderOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          1: networks['0x1'].rpc,
          4: networks['0x4'].rpc,
          5: networks['0x5'].rpc,
          1337: networks['0x539'].rpc,
        },
      },
    },
  }

  return (
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
      <WalletProvider
        web3modalOptions={{
          cacheProvider: true,
          providerOptions: providerOptions,
          theme: 'dark',
        }}
        networks={networks}
        defaultChainId={CHAIN_ID}
      >
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
