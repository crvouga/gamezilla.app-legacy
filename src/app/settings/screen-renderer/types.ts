import { VDomImplWeb } from '~/@/vdom/vdom-impl-web'

export type ModelFrontend = {
  settings_renderVDomImpl: VDomImplWeb
  settings_renderVDomImplInitial: VDomImplWeb
}

export type MsgFrontend =
  | { t: 'renderer.clicked-back-button' }
  | { t: 'renderer.clicked-renderer'; vDomImpl: VDomImplWeb }
