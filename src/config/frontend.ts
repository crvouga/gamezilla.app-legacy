import { VDomImpl } from '~/@/vdom/vdom-impl'

const VDOM_IMPL = VDomImpl.getUrl({ fallback: 'inferno' })

const BACKEND_URL = process.env.BACKEND_URL

const TOPIC_URL = process.env.TOPIC_URL

export const CONFIG_FRONTEND = {
  VDOM_IMPL,
  BACKEND_URL,
  TOPIC_URL,
}
