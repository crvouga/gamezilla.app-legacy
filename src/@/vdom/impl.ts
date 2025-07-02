import { CONFIG_FRONTEND } from '~/config/frontend'
import { init } from './impl-init'
import { ICreateElement, ICreatePortal, IRender, RenderNode } from './interface'

export let Render: (node: RenderNode) => IRender = () => () => {}
export let createPortal: ICreatePortal = () => null
export let h: ICreateElement = () => null

export const vdomEngineInitialized = new Promise<void>(async (resolve) => {
  if (typeof window === 'undefined') return resolve()

  const vdomEngine = await init(CONFIG_FRONTEND.VDOM_IMPL)

  Render = (node) => vdomEngine.render(node)
  createPortal = vdomEngine.createPortal
  h = vdomEngine.createElement
  resolve()
})
