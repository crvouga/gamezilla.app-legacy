import { isAnyMsg } from '~/@/msg/msg'
import { VDomImplWeb } from '~/@/vdom/vdom-impl-web'

export type ModelFrontend = {
  render_vDomImpl: VDomImplWeb
  render_vDomImplInitial: VDomImplWeb
}

export type MsgFrontend = { t: 'renderer_clickedBackButton' } | { t: 'renderer_clickedRenderer'; vDomImpl: VDomImplWeb }

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('renderer_')
}
