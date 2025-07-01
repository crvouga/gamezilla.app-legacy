import { VirtualDomEngine } from './interface'
import { VDomImpl } from './vdom-impl'

export const init = async (vdomImpl: VDomImpl): Promise<VirtualDomEngine> => {
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
