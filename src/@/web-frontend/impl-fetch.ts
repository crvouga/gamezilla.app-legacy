import { IWebFrontend } from './interface'

export type Config = {
  t: 'fetch'
  fetch: Fetch
}

export const WebFrontend = (config: Config): IWebFrontend => {
  return {
    async fetch(request) {
      return await config.fetch(request)
    },
  }
}
