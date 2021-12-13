export const SUPPORTED_NETWORKS: {
  [chainId: number]: {
    chainId: number
    name: string
    symbol: string
    explorer: string
    rpc: string
  }
} = {
  4: {
    chainId: 4,
    name: 'Rinkeby',
    symbol: 'ETH',
    explorer: 'https://rinkeby.etherscan.io/',
    rpc: 'https://rinkeby.infura.io/v3/e039ebf983d0477ca69a543b1c62101a',
  },
  1337: {
    chainId: 1337,
    name: 'Hardhat',
    symbol: 'ETH',
    explorer: 'http://localhost:1234/',
    rpc: 'http://localhost:8545',
  },
}

export const AUTO_UPDATE_BALANCE_INTERVAL = 1000 * 10 // 15 seconds
export const DEFAULT_NETWORK = 4
