import { CONFIG_FRONTEND } from '~/config/frontend'
import { VDomImpl } from '../vdom-impl'
import { initInferno } from './impl-inferno'
import { initPreact } from './impl-preact'
import { initReact } from './impl-react'
import { V } from './interface'

export const init = (vdomImpl: VDomImpl) => {
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

export const v: V = init(CONFIG_FRONTEND.VDOM_IMPL)
