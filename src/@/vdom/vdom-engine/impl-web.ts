import { ImplInferno } from './impl-inferno'
import { ImplPreact } from './impl-preact'
import { ImplReact } from './impl-react'
import { ImplSnabbdom } from './impl-snabbdom'
import { IVirtualDomEngine } from './interface'

export type ImplWeb = ImplReact | ImplPreact | ImplInferno | ImplSnabbdom

const init = async (config: ImplWeb): Promise<IVirtualDomEngine> => {
  switch (config.t) {
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

export const ImplWeb = {
  init,
}
