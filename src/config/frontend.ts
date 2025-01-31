import { VDomImpl } from '../@/vdom/vdom-impl'

const VDOM_IMPL = VDomImpl.of('inferno')

const VDOM_IMPL_TEST = VDomImpl.of('react-with-compiler')

const VITE_BACKEND_URL: unknown = import.meta.env?.VITE_BACKEND_URL

const VITE_POWERSYNC_URL: unknown = import.meta.env?.VITE_POWERSYNC_URL

export const CONFIG_FRONTEND = {
  VDOM_IMPL,
  VDOM_IMPL_TEST,
  VITE_BACKEND_URL,
  VITE_POWERSYNC_URL,
}
