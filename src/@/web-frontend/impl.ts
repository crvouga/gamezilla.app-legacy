import * as ImplFetch from './impl-fetch'
import { IWebFrontend } from './interface'

export type Config = ImplFetch.Config

export const WebFrontend = (config: Config): IWebFrontend => {
  switch (config.t) {
    case 'fetch': {
      return ImplFetch.WebFrontend(config)
    }
  }
}
