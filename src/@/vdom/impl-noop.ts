import { VirtualDomEngine } from './interface'

export const initNoop = (): VirtualDomEngine => {
  return {
    render: (_node) => {
      return () => {}
    },
    createPortal: (_vDom, _container) => {
      return null
    },
    createElement: (_tag: any, _props: any, _children: any) => {
      return null
    },
  }
}
