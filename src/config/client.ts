import { VDomImpl } from '../@/vdom/vdom-impl'
import { IS_TEST } from './shared'

export const VDOM_IMPL = VDomImpl.of('react-with-compiler')

export const VDOM_IMPL_TEST = VDomImpl.of('react-with-compiler')

export const VDOM_IMPL_CURRENT = IS_TEST ? VDOM_IMPL_TEST : VDOM_IMPL

export const SERVER_URL = import.meta.env?.VITE_SERVER_URL ? String(import.meta.env?.VITE_SERVER_URL) : ''
