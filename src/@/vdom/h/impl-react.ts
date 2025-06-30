import { createElement, Fragment } from 'react'
import { VDom } from '../vdom'
import { H } from './interface'

export const initReact = (): H => {
  return (tag: any, props: any, children) => {
    if (tag === 'fragment') {
      return createElement(Fragment, props, ...(children ?? [])) as VDom
    }
    return createElement(tag, props, ...(children ?? [])) as VDom
  }
}
