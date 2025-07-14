import { Brand } from '../brand/brand'

export type Url = Brand<string, 'Url'>

const derive = (input: string): Url => {
  return ensureHttp(input) as Url
}

const ensureHttps = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return 'https://' + url
}

const ensureHttp = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return 'http://' + url
}

export const Url = {
  derive,
  ensureHttp,
  ensureHttps,
}
