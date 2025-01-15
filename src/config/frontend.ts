import { VDomImpl } from '../@/vdom/vdom-impl'
import { CONFIG_SHARED } from './shared'

const VDOM_IMPL = VDomImpl.of('inferno')

const VDOM_IMPL_TEST = VDomImpl.of('react-with-compiler')

const VDOM_IMPL_CURRENT = CONFIG_SHARED.IS_TEST ? VDOM_IMPL_TEST : VDOM_IMPL

const BACKEND_URL: unknown = import.meta.env?.VITE_BACKEND_URL

const INDEXED_DB_NAME = 'gamezilla-app'

export const CONFIG_FRONTEND = {
  VDOM_IMPL,
  VDOM_IMPL_TEST,
  VDOM_IMPL_CURRENT,
  BACKEND_URL,
  INDEXED_DB_NAME,
}
