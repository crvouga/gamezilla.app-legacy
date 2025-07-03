import { VDomImpl } from '../@/vdom/vdom-impl'

const VDOM_IMPL_DEFAULT = VDomImpl.of('inferno')
const VDOM_IMPL = VDomImpl.readFromUrl({ fallback: VDOM_IMPL_DEFAULT })

export const CONFIG_FRONTEND = {
  VDOM_IMPL,
  VDOM_IMPL_DEFAULT,
}
