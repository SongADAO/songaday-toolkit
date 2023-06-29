export const formatAddress = (
  address: string | null | undefined,
  ensName?: string | null,
  chars = 4
): string => {
  if (ensName) return ensName
  else if (address)
    return `${address.substring(0, chars)}...${address.substring(
      address.length - chars
    )}`
  else return ''
}

export const parseTokenURI = (text: string) =>
  text.replace('ipfs://', 'https://ipfs.io/ipfs/')
