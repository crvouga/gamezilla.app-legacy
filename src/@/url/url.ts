import { Brand } from '../brand/brand'
import { HttpProtocol } from '../http/protocol'

export type Url = Brand<string, 'Url'>

const derive = (input: string, protocol: HttpProtocol): Url => {
  switch (protocol) {
    case 'http':
      return ensureHttp(input)
    case 'https':
      return ensureHttps(input)
  }
}

const of = (input: string): Url => {
  return input as Url
}

const ensureHttps = (url: string): Url => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return of(url)
  }
  return of('https://' + url)
}

const ensureHttp = (url: string): Url => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return of(url)
  }
  return of('http://' + url)
}

export const Url = {
  derive,
  ensureHttp,
  ensureHttps,
}
