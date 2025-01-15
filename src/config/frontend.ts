import { VDomImpl } from '../@/vdom/vdom-impl'
import { IS_TEST } from './shared'

export const VDOM_IMPL = VDomImpl.of('inferno')

export const VDOM_IMPL_TEST = VDomImpl.of('react-with-compiler')

export const VDOM_IMPL_CURRENT = IS_TEST ? VDOM_IMPL_TEST : VDOM_IMPL

export const BACKEND_URL: unknown = import.meta.env?.VITE_BACKEND_URL

export const INDEXED_DB_NAME = 'gamezilla-app'
