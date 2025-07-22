import { Sub } from '../../sub'
import { VDomImpl } from '../vdom-impl'
import { ICreateElement, IRender, IVirtualDomEngine } from './interface'

export let render: IRender
export let h: ICreateElement

const initialize = async (vdomImpl: VDomImpl) => {
  if (typeof window === 'undefined') return
  const vdomEngine = await init(vdomImpl)
  render = vdomEngine.render
  h = vdomEngine.createElement
}

const init = async (vdomImpl: VDomImpl): Promise<IVirtualDomEngine> => {
  switch (vdomImpl) {
    case 'react': {
      const { ImplReact } = await import('./impl-react')
      return ImplReact.init({ t: 'react' })
    }
    case 'preact': {
      const { ImplPreact } = await import('./impl-preact')
      return ImplPreact.init({ t: 'preact' })
    }
    case 'inferno': {
      const { ImplInferno } = await import('./impl-inferno')
      return ImplInferno.init({ t: 'inferno' })
    }
    case 'snabbdom': {
      const { ImplSnabbdom } = await import('./impl-snabbdom')
      return ImplSnabbdom.init({ t: 'snabbdom' })
    }
  }
}

const event = Sub.create<{ t: 'changed-vdom-impl'; vdomImpl: VDomImpl }>()

export const VDomEngine = {
  initialize,
  event,
}
