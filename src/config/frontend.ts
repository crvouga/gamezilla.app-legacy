import { VDomImpl } from '../@/vdom/vdom-impl'

const ensureSecureProtocol = (url: string): string => {
  if (url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }
  return `https://${url}`
}

const VDOM_IMPL = VDomImpl.of('inferno')

const VDOM_IMPL_TEST = VDomImpl.of('react-with-compiler')

const VITE_BACKEND_URL: string = ensureSecureProtocol(import.meta.env?.VITE_BACKEND_URL)

const VITE_POWERSYNC_URL: string = ensureSecureProtocol(String(import.meta.env?.VITE_POWERSYNC_URL))

export const CONFIG_FRONTEND = {
  VDOM_IMPL,
  VDOM_IMPL_TEST,
  VITE_BACKEND_URL,
  VITE_POWERSYNC_URL,
}
