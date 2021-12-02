import { SUPPORTED_NETWORKS } from '@/web3/constants'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { IProviderOptions } from 'web3modal'

export const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        4: SUPPORTED_NETWORKS[4].rpc,
        1337: SUPPORTED_NETWORKS[1337].rpc,
      },
    },
  },
}
