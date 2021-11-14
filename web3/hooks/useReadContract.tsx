import { Contract } from '@ethersproject/contracts'
import { useEffect, useState } from 'react'

import { Awaited, ContractFunctions, ContractInstance } from './types'
export const useReadContract = <
  TContract extends ContractInstance = any,
  TFunctionName extends string & keyof ContractFunctions<TContract> = string
>(
  contract: TContract | Contract | null,
  functionName: TFunctionName,
  ...args: Parameters<ContractFunctions<TContract>[TFunctionName]>
): {
  loading: boolean
  error: Error | null
  response:
    | Awaited<ReturnType<ContractFunctions<TContract>[TFunctionName]>>
    | undefined
} => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [response, setResponse] = useState(undefined)

  useEffect(() => {
    const fetchResponse = async () => {
      if (!contract) {
        return {
          loading: false,
          error: new Error('No contract provided'),
          response: undefined,
        }
      }
      try {
        const response = await (contract as Contract)[functionName](...args)

        setResponse(response)
      } catch (error) {
        setError(error as Error)
      } finally {
        setLoading(false)
      }
    }
    fetchResponse()
  }, [(contract as Contract)?.address])

  return {
    loading,
    error,
    response,
  }
}
