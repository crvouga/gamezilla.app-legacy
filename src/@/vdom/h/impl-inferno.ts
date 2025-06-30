import { Fragment } from 'inferno'
import { createElement } from 'inferno-create-element'
import { VDom } from '../vdom'
import { H } from './interface'

export const initInferno = (): H => {
  return (tag: any, props: any, ...children: any[]) => {
    if (tag === 'fragment') {
      return createElement(Fragment, props, ...children) as VDom
    }
    return createElement(tag, props, ...children) as VDom
  }
}
