import { Brand } from '../brand/brand'
import { HttpProtocol } from '../http/protocol'

export type Url = Brand<string, 'Url'>

/**
 * Derives a URL with the specified HTTP protocol
 * @param input The input URL string
 * @param protocol The HTTP protocol to use ('http' or 'https')
 * @returns A URL with the specified protocol
 * @example
 * Url.derive('example.com', 'https') // returns 'https://example.com'
 * Url.derive('ws://example.com', 'http') // returns 'http://example.com'
 */
const derive = (input: string, protocol: HttpProtocol): Url => {
  switch (protocol) {
    case 'http':
      return ensureHttp(input)
    case 'https':
      return ensureHttps(input)
  }
}

/**
 * Creates a URL from a string
 * @param input The input URL string
 * @returns A branded URL type
 * @example
 * const url = of('https://example.com')
 */
const of = (input: string): Url => {
  return input as Url
}

/**
 * Checks if a URL has a WebSocket protocol (ws:// or wss://)
 * @param url The URL to check
 * @returns True if the URL has a WebSocket protocol
 * @example
 * hasWebsocketProtocol('ws://example.com') // returns true
 * hasWebsocketProtocol('http://example.com') // returns false
 */
const hasWebsocketProtocol = (url: string): boolean => {
  return url.startsWith('ws://') || url.startsWith('wss://') || url.startsWith('ws:') || url.startsWith('wss:')
}

/**
 * Ensures a URL uses HTTPS protocol
 * @param url The input URL
 * @returns A URL with HTTPS protocol
 * @example
 * Url.ensureHttps('example.com') // returns 'https://example.com'
 * Url.ensureHttps('http://example.com') // returns 'http://example.com'
 * Url.ensureHttps('ws://example.com') // returns 'https://example.com'
 */
const ensureHttps = (url: string): Url => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return of(url)
  }
  if (hasWebsocketProtocol(url)) {
    return of('https://' + url.replace(/^wss?:\/\//, ''))
  }
  return of('https://' + url)
}

/**
 * Ensures a URL uses HTTP protocol
 * @param url The input URL
 * @returns A URL with HTTP protocol
 * @example
 * Url.ensureHttp('example.com') // returns 'http://example.com'
 * Url.ensureHttp('https://example.com') // returns 'https://example.com'
 * Url.ensureHttp('ws://example.com') // returns 'http://example.com'
 */
const ensureHttp = (url: string): Url => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return of(url)
  }
  if (hasWebsocketProtocol(url)) {
    return of('http://' + url.replace(/^wss?:\/\//, ''))
  }
  return of('http://' + url)
}

/**
 * Removes the path component from a URL
 * @param url The input URL
 * @returns The URL with path removed
 * @example
 * Url.removePath('https://example.com/path') // returns 'https://example.com'
 */
const removePath = (url: Url): Url => {
  const parts = url.split('/')
  // If there are only 3 parts (protocol, empty, domain), there's no path to remove
  if (parts.length <= 3) {
    return of(url)
  }
  return of(parts.slice(0, -1).join('/'))
}

export const Url = {
  derive,
  ensureHttp,
  ensureHttps,
  removePath,
}
