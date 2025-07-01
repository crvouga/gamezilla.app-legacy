import { CONFIG_FRONTEND } from '~/config/frontend'
import { initNoop } from './impl-noop'
import { ICreateElement, ICreatePortal, IRender, RenderNode, VirtualDomEngine } from './interface'
import { VDomImpl } from './vdom-impl'

const init = async (vdomImpl: VDomImpl): Promise<VirtualDomEngine> => {
  switch (vdomImpl) {
    case 'react': {
      const { initReact } = await import('./impl-react')
      return initReact()
    }
    case 'preact': {
      const { initPreact } = await import('./impl-preact')
      return initPreact()
    }
    case 'inferno': {
      const { initInferno } = await import('./impl-inferno')
      return initInferno()
    }
    case 'snabbdom': {
      const { initSnabbdom } = await import('./impl-snabbdom')
      return initSnabbdom()
    }
  }
}

const vdomEngine = initNoop()

export let Render: (node: RenderNode) => IRender = vdomEngine.render

export let createPortal: ICreatePortal = vdomEngine.createPortal

export let h: ICreateElement = vdomEngine.createElement

export const vdomEngineInitialized = new Promise<void>((resolve) => {
  if (typeof window !== 'undefined') {
    init(VDomImpl.readFromUrl({ fallback: CONFIG_FRONTEND.VDOM_IMPL })).then((vdomEngine) => {
      Render = (node) => vdomEngine.render(node)
      createPortal = vdomEngine.createPortal
      h = vdomEngine.createElement
      resolve()
    })
  } else {
    resolve()
  }
})
