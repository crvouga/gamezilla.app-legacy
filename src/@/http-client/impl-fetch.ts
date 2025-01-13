import { IHttpClient } from './interface'

export type Config = {
  t: 'fetch'
  fetch: Fetch
}

export const HttpClient = (config: Config): IHttpClient => {
  return {
    async fetch(request) {
      return await config.fetch(request)
    },
  }
}
