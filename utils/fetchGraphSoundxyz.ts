import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  gql,
  ApolloQueryResult,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const SUBGRAPH_MAP: { [network: string]: string } = {
  1: 'https://api.sound.xyz/graphql',
  4: 'https://api.sound.xyz/graphql',
}

const fetchGraphSoundxyz = async <T, V>(
  chainId: number,
  query: string,
  variables?: V
): Promise<ApolloQueryResult<T>> => {
  const httpLink = createHttpLink({
    uri: SUBGRAPH_MAP[chainId],
  })

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = '357caa29-3d5a-48cf-8d38-438399302e4b'

    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        'X-Sound-Client-Key': token ? token : '',
      },
    }
  })

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  })

  return client.query<T, V>({
    query: gql(query),
    variables,
  })
}

export default fetchGraphSoundxyz
