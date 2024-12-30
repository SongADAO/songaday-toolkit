import { defineChain } from 'viem'

export const base = defineChain({
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [
        'https://base-mainnet.infura.io/v3/60a7b2c16321439a917c9e74a994f7df',
      ],
    },
    public: {
      http: [
        'https://base-mainnet.infura.io/v3/60a7b2c16321439a917c9e74a994f7df',
      ],
    },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 5022,
    },
  },
})
