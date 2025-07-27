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

const hasWebsocketProtocol = (url: string): boolean => {
  return url.startsWith('ws://') || url.startsWith('wss://') || url.startsWith('ws:') || url.startsWith('wss:')
}

const ensureHttps = (url: string): Url => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return of(url)
  }
  if (hasWebsocketProtocol(url)) {
    return of('https://' + url.replace(/^wss?:\/\//, ''))
  }
  return of('https://' + url)
}

const ensureHttp = (url: string): Url => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return of(url)
  }
  if (hasWebsocketProtocol(url)) {
    return of('http://' + url.replace(/^wss?:\/\//, ''))
  }
  return of('http://' + url)
}

export const Url = {
  derive,
  ensureHttp,
  ensureHttps,
}
