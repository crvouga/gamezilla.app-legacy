import { VDomImpl } from '../@/vdom/vdom-impl'

const VDOM_IMPL = VDomImpl.readFromUrl({ fallback: VDomImpl.of('snabbdom') })

export const CONFIG_FRONTEND = {
  VDOM_IMPL,
}
