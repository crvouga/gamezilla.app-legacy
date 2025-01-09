import { VDomImpl } from '../@/vdom/vdom-impl'
import { IS_TEST } from './shared'

const env: Record<string, unknown> = {
  ...(typeof process.env === 'undefined' ? {} : process.env),
  ...(typeof import.meta.env === 'undefined' ? {} : import.meta.env),
}

console.log({ env })

export const VDOM_IMPL = VDomImpl.from(env.VITE_VDOM_IMPL) || VDomImpl.of('inferno')

export const VDOM_IMPL_TEST = VDomImpl.of('react-with-compiler')

export const VDOM_IMPL_CURRENT = IS_TEST ? VDOM_IMPL_TEST : VDOM_IMPL

export const SERVER_URL = env.VITE_SERVER_URL ? String(env.VITE_SERVER_URL) : ''
