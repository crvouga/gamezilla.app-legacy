import { IHttpClient } from './interface'

export type Config = {
  t: 'fetch'
}

export const HttpClient = (_config: Config): IHttpClient => {
  return {
    async fetch(request) {
      const response = await fetch(request, {
        credentials: 'include',
      })

      return response
    },
  }
}
