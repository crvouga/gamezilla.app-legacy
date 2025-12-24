import { HttpProtocol } from '../http/protocol'
import { s } from '../schema'

const schema = s.brand(s.str(), 'Url')

export type Url = s.Infer<typeof schema>

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
 * Ensures a URL uses WS protocol
 * @param url The input URL
 * @returns A URL with WS protocol
 * @example
 * Url.ensureWs('example.com') // returns 'ws://example.com'
 * Url.ensureWs('wss://example.com') // returns 'ws://example.com'
 * Url.ensureWs('http://example.com') // returns 'ws://example.com'
 */
const ensureWs = (url: string): Url => {
  if (url.startsWith('ws://')) {
    return of(url)
  }
  if (url.startsWith('wss://')) {
    return of('ws://' + url.slice(6))
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return of('ws://' + url.replace(/^https?:\/\//, ''))
  }
  return of('ws://' + url)
}

/**
 * Ensures a URL uses WSS protocol
 * @param url The input URL
 * @returns A URL with WSS protocol
 * @example
 * Url.ensureWss('example.com') // returns 'wss://example.com'
 * Url.ensureWss('ws://example.com') // returns 'wss://example.com'
 * Url.ensureWss('http://example.com') // returns 'wss://example.com'
 */
const ensureWss = (url: string): Url => {
  if (url.startsWith('wss://')) {
    return of(url)
  }
  if (url.startsWith('ws://')) {
    return of('wss://' + url.slice(5))
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return of('wss://' + url.replace(/^https?:\/\//, ''))
  }
  return of('wss://' + url)
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

/**
 * Sets the path component of a URL
 * @param url The input URL
 * @param path The path to set (without leading slash)
 * @returns The URL with the new path
 * @example
 * Url.setPath('https://example.com/old-path', 'new-path') // returns 'https://example.com/new-path'
 * Url.setPath('https://example.com', 'new-path') // returns 'https://example.com/new-path'
 */
const setPath = (url: Url, path: string): Url => {
  const withoutPath = removePath(url)
  return of(`${withoutPath}/${path}`)
}

export const Url = {
  derive,
  ensureHttp,
  ensureHttps,
  ensureWs,
  ensureWss,
  removePath,
  setPath,
  schema,
  of,
}
