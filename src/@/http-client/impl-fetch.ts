import { IHttpClient } from './interface'

export type Config = {
  t: 'fetch'
  mapHeaders?: (headers: Headers) => Headers
  credentials?: 'include' | 'omit'
  baseUrl?: string
}

export const HttpClient = (config: Config): IHttpClient => {
  return {
    async fetch(request) {
      const response = await fetch(request, {
        credentials: config.credentials,
        headers: config.mapHeaders?.(request.headers) ?? request.headers,
      })

      return response
    },
  }
}
