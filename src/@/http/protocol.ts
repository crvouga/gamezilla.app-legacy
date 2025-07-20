export type HttpProtocol = 'http' | 'https'

const fromWindow = (): HttpProtocol | null => {
  if (typeof window === 'undefined') return null
  return window.location.protocol.includes('https') ? 'https' : 'http'
}

export const HttpProtocol = { fromWindow }
