import { VDom } from '../vdom'
import { H } from './interface'

export const initInferno = async (): Promise<H> => {
  const { createElement } = await import('inferno-create-element')

  return (tag: any, props: any, ...children: any[]) => {
    return createElement(tag, props, ...children) as VDom
  }
}
