import { Sub } from '../sub'
import { VDomEngine } from './h'
import { ImplWeb } from './vdom-engine/impl-web'
import { VDomImplWeb } from './vdom-impl-web'
import { IVdomImplWebStorage } from './vdom-impl-web-storage'

const init = async (config: { vdomImplStorage: IVdomImplWebStorage }) => {
  const swapped = Sub.init<true>()

  const vdomImpl = await config.vdomImplStorage.get()
  const vdomEngine = await ImplWeb.init({ t: vdomImpl })
  VDomEngine.set(vdomEngine)
  let root = document.createElement('div')
  document.body.innerHTML = ''
  document.body.appendChild(root)

  VDomImplWeb.swapVDomEngine.sub(async (vdomImpl) => {
    await config.vdomImplStorage.set(vdomImpl)
    const vdomEngine = await ImplWeb.init({ t: vdomImpl })
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
