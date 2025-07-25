import { Sub } from '../sub'
import { VDomEngine } from './h'
import { ImplWeb } from './vdom-engine/impl-web'
import { VDomImplWeb } from './vdom-impl-web'

const init = async () => {
  const swapped = Sub.init<true>()

  const vdomEngine = await ImplWeb.init({ t: VDomImplWeb.getUrl() })
  VDomEngine.set(vdomEngine)
  let root = document.createElement('div')
  document.body.innerHTML = ''
  document.body.appendChild(root)

  VDomImplWeb.swapVDomEngine.sub(async (vdomImpl) => {
    VDomImplWeb.setUrl(vdomImpl)
    const vdomEngine = await ImplWeb.init({ t: VDomImplWeb.getUrl() })
    VDomEngine.set(vdomEngine)
    document.body.innerHTML = ''
    root = document.createElement('div')
    document.body.appendChild(root)
    swapped.pub(true)
  })

  return {
    swapped,
    getRoot: () => root,
  }
}

export const SwapVDomEngine = {
  init,
}
