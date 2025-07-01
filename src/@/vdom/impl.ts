import { CONFIG_FRONTEND } from '~/config/frontend'
import { initInferno } from './impl-inferno'
import { initPreact } from './impl-preact'
import { initReact } from './impl-react'
// import { initSnabbdom } from './impl-snabbdom'
import { ICreateElement, ICreatePortal, IRender, RenderNode, VirtualDomEngine } from './interface'
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

const vdomEngine = init(VDomImpl.readFromUrl({ fallback: CONFIG_FRONTEND.VDOM_IMPL }))

export const Render: (node: RenderNode) => IRender = vdomEngine.render

export const createPortal: ICreatePortal = vdomEngine.createPortal

export const h: ICreateElement = vdomEngine.createElement
