import { ImplFetch } from './impl-fetch'
import { IHttpClient } from './interface'

export type HttpClient = ImplFetch

const init = (config: HttpClient): IHttpClient => {
  switch (config.t) {
    case 'fetch': {
      return ImplFetch.init(config)
    }
  }
}

export const HttpClient = {
  init,
}
