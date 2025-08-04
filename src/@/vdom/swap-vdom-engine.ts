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
  let root = createRoot()
  document.body.innerHTML = ''
  document.body.appendChild(root)

  VDomImplWeb.swapVDomEngine.sub(async (vdomImpl) => {
    await config.vdomImplStorage.set(vdomImpl)
    const vdomEngine = await ImplWeb.init({ t: vdomImpl })
    VDomEngine.set(vdomEngine)
    document.body.innerHTML = ''
    root = createRoot()
    document.body.appendChild(root)
    swapped.pub(true)
  })

  return {
    swapped,
    getRoot: () => root,
  }
}

const createRoot = () => {
  const root = document.createElement('div')
  root.style.height = '100dvh'
  root.style.width = '100dvw'
  root.style.display = 'flex'
  root.style.margin = '0'
  root.style.padding = '0'
  root.style.overflow = 'hidden'
  root.style.backgroundColor = 'black'
  root.style.color = 'white'
  root.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif'
  root.style.lineHeight = '1.5'
  return root
}

export const SwapVDomEngine = {
  init,
}
