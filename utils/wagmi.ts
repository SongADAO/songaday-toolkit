import { INFURA_ID } from '@/utils/constants'
import {
  arbitrum,
  optimism,
  mainnet,
  sepolia,
  zora,
  baseSepolia,
  // zoraSepolia,
} from 'viem/chains'
import { type Chain } from 'viem'
import { base } from 'utils/base-chain'

import { createConfig, fallback, http, webSocket } from 'wagmi'

const walletConnectProjectId = '55df63e3faebd774218c3990b418f5cd'

const chains: Chain[] = [
  mainnet,
  optimism,
  arbitrum,
  base,
  zora,
  // Testnets
  sepolia,
  baseSepolia,
  // zoraSepolia,
  // Local
  // hardhat,
]

const wagmiConfig = createConfig({
  // connectors: w3mConnectors({ projectId: walletConnectProjectId, chains }),
  chains: [
    mainnet,
    optimism,
    arbitrum,
    base,
    zora,
    // Testnets
    sepolia,
    baseSepolia,
    // zoraSepolia,
    // Local
    // hardhat,
  ],
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

export { wagmiConfig, chains, walletConnectProjectId }
