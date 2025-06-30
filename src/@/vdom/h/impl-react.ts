import { VDom } from '../vdom'
import { H } from './interface'

export const initReact = async (): Promise<H> => {
  const { createElement } = await import('react')

  return (tag: any, props: any, ...children: any[]) => {
    return createElement(tag, props, ...children) as VDom
  }
}
