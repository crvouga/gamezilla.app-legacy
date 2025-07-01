import { VDom } from '../vdom'
import { createElement, Fragment } from 'preact'
import { V } from './interface'

export const initPreact = (): V => {
  return (tag: any, props: any, children) => {
    if (tag === 'fragment') {
      return createElement(Fragment, props, ...(children ?? [])) as VDom
    }
    return createElement(tag, props, ...(children ?? [])) as VDom
  }
}
