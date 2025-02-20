import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import GBML2BaseWinners from '@/components/GBML2BaseWinners'

import { GBM_L2_BASE_SUBGRAPH } from '@/utils/constants'

const apolloClientBase = new ApolloClient({
  cache: new InMemoryCache(),
  uri: GBM_L2_BASE_SUBGRAPH,
})

interface Props {}

function GBML2BaseWinnersProvider({}: Readonly<Props>) {
  return (
    <ApolloProvider client={apolloClientBase}>
      <GBML2BaseWinners />
    </ApolloProvider>
  )
}

export default GBML2BaseWinnersProvider
