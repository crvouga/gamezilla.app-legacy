import { VDom } from '../vdom'
import { H } from './interface'

export const initPreact = async (): Promise<H> => {
  const { createElement } = await import('preact')

  return (tag: any, props: any, ...children: any[]) => {
    return createElement(tag, props, ...children) as VDom
  }
}
