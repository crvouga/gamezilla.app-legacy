import { IWebClient } from './interface'

export type Config = {
  t: 'fetch'
  fetch: Fetch
}

export const WebClient = (config: Config): IWebClient => {
  return {
    async fetch(request) {
      return await config.fetch(request)
    },
  }
}
