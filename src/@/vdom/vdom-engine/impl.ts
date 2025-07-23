import { ICreateElement, IRender, IVirtualDomEngine } from './interface'

export let render: IRender
export let h: ICreateElement

const set = (vdomEngine: IVirtualDomEngine) => {
  render = vdomEngine.render
  h = vdomEngine.createElement
}

export const VDomEngine = {
  set,
}
