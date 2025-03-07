import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { type Chain } from 'viem'
import { fallback, http, webSocket } from 'wagmi'
import {
  arbitrum,
  base,
  baseSepolia,
  mainnet,
  optimism,
  sepolia,
  zora,
} from 'wagmi/chains'

import {
  // ALCHEMY_ID,
  // CONDUIT_ID,
  INFURA_ID,
  USE_TESTNET,
  WALLET_CONNECT_PROJECT_ID,
} from '@/utils/constants'

export const chains: Chain[] = [
  mainnet,
  optimism,
  arbitrum,
  base,
  zora,
  ...(USE_TESTNET ? [baseSepolia, sepolia] : []),
]

export const wagmiConfig = getDefaultConfig({
  appName: 'Song-A-Day',
  chains: [
    mainnet,
    optimism,
    arbitrum,
    base,
    zora,
    ...(USE_TESTNET ? [baseSepolia, sepolia] : []),
  ],
  projectId: WALLET_CONNECT_PROJECT_ID,
  ssr: false,
  transports: {
    [arbitrum.id]: fallback([
      webSocket(`wss://arbitrum-mainnet.infura.io/ws/v3/${INFURA_ID}`),
      http(`https://arbitrum-mainnet.infura.io/v3/${INFURA_ID}`),
    ]),
    [base.id]: fallback([
      webSocket(`wss://base-mainnet.infura.io/ws/v3/${INFURA_ID}`),
      http(`https://base-mainnet.infura.io/v3/${INFURA_ID}`),
    ]),
    [baseSepolia.id]: fallback([
      webSocket(`wss://base-sepolia-rpc.publicnode.com`),
      http(),
    ]),
    [mainnet.id]: fallback([
      webSocket(`wss://mainnet.infura.io/ws/v3/${INFURA_ID}`),
      http(`https://mainnet.infura.io/v3/${INFURA_ID}`),
    ]),
    [optimism.id]: fallback([
      webSocket(`wss://optimism-mainnet.infura.io/ws/v3/${INFURA_ID}`),
      http(`https://optimism-mainnet.infura.io/v3/${INFURA_ID}`),
    ]),
    [sepolia.id]: fallback([
      webSocket(`wss://sepolia.infura.io/ws/v3/${INFURA_ID}`),
      http(`https://sepolia.infura.io/v3/${INFURA_ID}`),
    ]),
    [zora.id]: http(),
    // [zora.id]: http(`https://rpc-zora-mainnet-0.t.conduit.xyz/${CONDUIT_ID}`),
    // [zora.id]: http(`https://zora-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`),
  },
})
