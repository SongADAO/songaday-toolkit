import { Contract, ContractTransaction } from '@ethersproject/contracts'
import { useCallback, useEffect, useState } from 'react'

import { ContractFunctions, ContractInstance } from './types'
export const useWriteContract = <
  TContract extends ContractInstance = any,
  TFunctionName extends string & keyof ContractFunctions<TContract> = string
>(
  contract: TContract | Contract | null,
  functionName: TFunctionName,
  options?: {
    confirmations?: number
    onError?: (error: Error) => void
    onResponse?: (response: ContractTransaction) => void
  }
): [
  (
    ...args: Parameters<ContractFunctions<TContract>[TFunctionName]>
  ) => Promise<void>,
  {
    status: 'before-executing' | 'executing' | 'waiting' | 'confirmed' | 'error'
    error: Error | null
    response: ContractTransaction | undefined
  }
] => {
  const [status, setStatus] = useState<
    'before-executing' | 'executing' | 'waiting' | 'confirmed' | 'error'
  >('before-executing')
  const [error, setError] = useState<Error | null>(null)
  const [response, setResponse] = useState<ContractTransaction | undefined>(
    undefined
  )

  useEffect(() => {
    const cleanup = () => {
      if (!contract) {
        return {
          status: 'before-executing',
          error: new Error('No contract provided'),
          response: undefined,
        }
      }

      return {
        status: 'before-executing',
        error: null,
        response: undefined,
      }
    }

    cleanup()
  }, [(contract as Contract)?.address, functionName])

  const mutate = useCallback(
    async (
      ...args: Parameters<ContractFunctions<TContract>[TFunctionName]>
    ) => {
      if (!contract) {
        const error = new Error('No contract provided')
        options?.onError?.(error)
        setError(error)
        setStatus('error')
      }
      try {
        setStatus('executing')
        const response: ContractTransaction = await (contract as Contract)[
          functionName
        ](...args)
        options?.onResponse?.(response)
        setResponse(response)
        setStatus('waiting')
        await response.wait(options?.confirmations ?? undefined)
        setStatus('confirmed')
      } catch (error) {
        options?.onError?.(error as Error)
        setError(error as Error)
        setStatus('error')
      }
    },
    [(contract as Contract)?.address, functionName]
  )

  return [
    mutate,
    {
      status,
      error,
      response,
    },
  ]
}
