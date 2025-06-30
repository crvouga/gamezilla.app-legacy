import { createElement } from 'react'
import { VDom } from '../vdom'
import { H } from './interface'

export const initReact = (): H => {
  return (tag: any, props: any, ...children: any[]) => {
    return createElement(tag, props, ...children) as VDom
  }
}
