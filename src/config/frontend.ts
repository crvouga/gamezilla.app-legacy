import { VDomImpl } from '~/@/vdom/vdom-impl'

const VDOM_IMPL = VDomImpl.getUrl({ fallback: 'inferno' })

export const CONFIG_FRONTEND = {
  VDOM_IMPL,
}
