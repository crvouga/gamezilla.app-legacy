import { VDomImpl } from '../@/vdom/vdom-impl'
import { CONFIG_SHARED } from './shared'

const VDOM_IMPL = VDomImpl.of('inferno')

const VDOM_IMPL_TEST = VDomImpl.of('react-with-compiler')

const VDOM_IMPL_CURRENT = CONFIG_SHARED.IS_TEST ? VDOM_IMPL_TEST : VDOM_IMPL

const VITE_BACKEND_URL: unknown = import.meta.env?.VITE_BACKEND_URL

export const CONFIG_FRONTEND = {
  VDOM_IMPL,
  VDOM_IMPL_TEST,
  VDOM_IMPL_CURRENT,
  VITE_BACKEND_URL,
}
