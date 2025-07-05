import { VDomImpl } from '~/@/vdom/vdom-impl'

export type ModelFrontend = {
  renderVDomImpl: VDomImpl
  renderVDomImplInitial: VDomImpl
}

export type MsgFrontend = { t: 'renderer.clicked-back-button' } | { t: 'renderer.clicked-renderer'; vDomImpl: VDomImpl }
