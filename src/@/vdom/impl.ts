import { Sub } from '../sub'
import { ICreateElement, ICreatePortal, IRender } from './interface'
import { VDomImpl } from './vdom-impl'

export let render: IRender
export let createPortal: ICreatePortal
export let h: ICreateElement

const initialize = async (vdomImpl: VDomImpl) => {
  if (typeof window === 'undefined') return
  const vdomEngine = await init(vdomImpl)
  render = vdomEngine.render
  createPortal = vdomEngine.createPortal
  h = vdomEngine.createElement
}

const init = async (vdomImpl: VDomImpl) => {
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

const event = Sub.create<{ t: 'changed-vdom-impl'; vdomImpl: VDomImpl }>()

export const VDomEngine = {
  initialize,
  event,
}
