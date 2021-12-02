class HttpError extends Error {
  response: any
  data: any
  status: any
}

export default async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(input, init)

    if (response.ok) {
      // if the server replies, there's always some data in json
      // if there's a network error, it will throw at the previous line
      const data = await response.json()
      return data
    }
    try {
      const errorJson = await response.json()
      const newError = new HttpError(response.statusText)
      newError.status = response.status
      newError.response = errorJson
      throw newError
    } catch (error: any) {
      if (error.message.indexOf('Unexpected token') > -1) {
        const newError = new HttpError(response.statusText)
        newError.status = 500
        newError.response = {
          reason: 'Server did not return any meaningful error',
        }
        throw newError
      } else {
        throw error
      }
    }
  } catch (error: any) {
    const newError = new HttpError(error.message)
    newError.status = error.status || 500
    newError.response = error.response || {}
    throw newError
  }
}
