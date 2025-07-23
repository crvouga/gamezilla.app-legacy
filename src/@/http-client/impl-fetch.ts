import { IHttpClient } from './interface'

export type ImplFetch = {
  t: 'fetch'
  mapHeaders?: (headers: Headers) => Headers
  credentials?: 'include' | 'omit'
  baseUrl?: string
}

const init = (config: ImplFetch): IHttpClient => {
  return {
    async fetch(request) {
      const headers = config.mapHeaders?.(request.headers) ?? request.headers

      const response = await fetch(request, {
        credentials: config.credentials,
        headers,
      })

      return response
    },
  }
}

export const ImplFetch = {
  init,
}
