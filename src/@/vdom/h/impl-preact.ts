import { VDom } from '../vdom'
import { createElement } from 'preact'
import { H } from './interface'

export const initPreact = (): H => {
  return (tag: any, props: any, ...children: any[]) => {
    return createElement(tag, props, ...children) as VDom
  }
}
