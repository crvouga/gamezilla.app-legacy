import { createElement } from 'inferno-create-element'
import { VDom } from '../vdom'
import { H } from './interface'

export const initInferno = (): H => {
  return (tag: any, props: any, ...children: any[]) => {
    return createElement(tag, props, ...children) as VDom
  }
}
