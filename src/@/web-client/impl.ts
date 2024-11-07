import * as ImplFetch from './impl-fetch'
import { IWebClient } from './interface'

export type Config = ImplFetch.Config

export const WebClient = (config: Config): IWebClient => {
  switch (config.t) {
    case 'fetch': {
      return ImplFetch.WebClient(config)
    }
  }
}
