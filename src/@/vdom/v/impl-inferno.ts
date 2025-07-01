import { Fragment } from 'inferno'
import { createElement } from 'inferno-create-element'
import { VDom } from '../vdom'
import { V } from './interface'

export const initInferno = (): V => {
  return (tag: any, props: any, children) => {
    if (tag === 'fragment') {
      return createElement(Fragment, props, ...(children ?? [])) as VDom
    }
    return createElement(tag, props, ...(children ?? [])) as VDom
  }
}
