import { CONFIG_FRONTEND } from '~/config/frontend'
import { initInferno } from './impl-inferno'
import { initPreact } from './impl-preact'
import { initReact } from './impl-react'
import { H } from './interface'

export let h: H

export const view = (props: { message: string }) => {
  return h('div', null, `Hello ${props.message}`)
}

switch (CONFIG_FRONTEND.VDOM_IMPL) {
  case 'react': {
    initReact().then((createElement) => {
      h = createElement
    })
    break
  }

  case 'preact': {
    initPreact().then((createElement) => {
      h = createElement
    })
    break
  }

  case 'inferno': {
    initInferno().then((createElement) => {
      h = createElement
    })
    break
  }
}
