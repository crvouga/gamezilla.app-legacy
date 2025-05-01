import { IHttpClient } from './interface'

export type Config = {
  t: 'fetch'
  defaultHeaders?: Record<string, string>
}

export const HttpClient = (_config: Config): IHttpClient => {
  return {
    async fetch(request) {
      const response = await fetch(request, {
        credentials: 'include',
        headers: {
          ..._config.defaultHeaders,
          ...request.headers,
        },
      })

      return response
    },
  }
}
