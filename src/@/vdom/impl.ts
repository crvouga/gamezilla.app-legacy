import { CONFIG_FRONTEND } from '~/config/frontend'
import { VDomImpl } from './vdom-impl'
import { initInferno } from './impl-inferno'
import { initPreact } from './impl-preact'
import { initReact } from './impl-react'
import { ICreatePortal, IRender, RenderNode, V, VirtualDomEngine } from './interface'

export const init = (vdomImpl: VDomImpl): VirtualDomEngine => {
  switch (vdomImpl) {
    case 'react': {
      return initReact()
    }
    case 'preact': {
      return initPreact()
    }
    case 'inferno': {
      return initInferno()
    }
  }
}

const vdomEngine = init(CONFIG_FRONTEND.VDOM_IMPL)

export const Render: (node: RenderNode) => IRender = vdomEngine.render

export const createPortal: ICreatePortal = vdomEngine.createPortal

export const v: V = vdomEngine.v
