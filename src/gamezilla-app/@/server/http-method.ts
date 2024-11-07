export type HttpRequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE'

export const stringToHttpRequestMethod = (input: string): HttpRequestMethod => {
  const cleaned = input.trim().toUpperCase()
  if (cleaned.includes('GET')) {
    return 'GET'
  }

  if (cleaned.includes('POST')) {
    return 'POST'
  }

  if (cleaned.includes('PUT')) {
    return 'PUT'
  }

  if (cleaned.includes('PATCH')) {
    return 'PATCH'
  }

  if (cleaned.includes('DELETE')) {
    return 'DELETE'
  }

  if (cleaned.includes('OPTIONS')) {
    return 'OPTIONS'
  }

  if (cleaned.includes('HEAD')) {
    return 'HEAD'
  }

  if (cleaned.includes('CONNECT')) {
    return 'CONNECT'
  }

  if (cleaned.includes('TRACE')) {
    return 'TRACE'
  }

  throw new Error(`Unknown method: ${input}`)
}
