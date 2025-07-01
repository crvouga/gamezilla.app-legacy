import { createElement, Fragment } from 'react'
import { VDom } from '../vdom'
import { V } from './interface'

export const initReact = (): V => {
  return (tag: any, props: any, children) => {
    if (tag === 'fragment') {
      return createElement(Fragment, props, ...(children ?? [])) as VDom
    }
    return createElement(tag, props, ...(children ?? [])) as VDom
  }
}
