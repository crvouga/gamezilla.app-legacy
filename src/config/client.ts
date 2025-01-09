import { VDomImpl } from '../@/vdom/vdom-impl'
import { env } from './env'
import { IS_TEST } from './shared'

export const VDOM_IMPL = VDomImpl.from(env.VITE_VDOM_IMPL) || VDomImpl.of('inferno')

export const VDOM_IMPL_TEST = VDomImpl.of('react-with-compiler')

export const VDOM_IMPL_CURRENT = IS_TEST ? VDOM_IMPL_TEST : VDOM_IMPL

export const SERVER_URL = env.VITE_SERVER_URL ? String(env.VITE_SERVER_URL) : ''
