import { CONFIG_FRONTEND } from '~/config/frontend'
import { initInferno } from './impl-inferno'
import { initPreact } from './impl-preact'
import { initReact } from './impl-react'
// import { initSnabbdom } from './impl-snabbdom'
import { ICreatePortal, IRender, RenderNode, V, VirtualDomEngine } from './interface'
import { VDomImpl } from './vdom-impl'

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
    case 'snabbdom': {
      throw new Error('Snabbdom is not supported in the browser')
      // return initSnabbdom()
    }
  }
}

const vdomEngine = init(VDomImpl.readFromUrl(CONFIG_FRONTEND.VDOM_IMPL))

export const Render: (node: RenderNode) => IRender = vdomEngine.render

export const createPortal: ICreatePortal = vdomEngine.createPortal

export const v: V = vdomEngine.v
