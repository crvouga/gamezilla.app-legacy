import { CONFIG_FRONTEND } from '~/config/frontend'
import { ICreateElement, ICreatePortal, IRender, RenderNode, VirtualDomEngine } from './interface'
import { VDomImpl } from './vdom-impl'

export let Render: (node: RenderNode) => IRender = () => () => {}
export let createPortal: ICreatePortal = () => null
export let h: ICreateElement = () => null

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
    case 'hyperapp': {
      const { initHyperapp } = await import('./impl-hyperapp')
      return initHyperapp()
    }
  }
}

export const vdomEngineInitialized = new Promise<void>(async (resolve) => {
  if (typeof window === 'undefined') return resolve()

  const vdomEngine = await init(CONFIG_FRONTEND.VDOM_IMPL)

  Render = (node) => vdomEngine.render(node)
  createPortal = vdomEngine.createPortal
  h = vdomEngine.createElement
  resolve()
})
