import * as ImplFetch from './impl-fetch'
import { IHttpClient } from './interface'

export type Config = ImplFetch.Config

export const HttpClient = (config: Config): IHttpClient => {
  switch (config.t) {
    case 'fetch': {
      return ImplFetch.HttpClient(config)
    }
  }
}
