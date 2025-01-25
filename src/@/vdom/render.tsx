import type { VDom } from './vdom'
import type { VDomImpl } from './vdom-impl'
// @ts-expect-error
import * as Inferno from 'inferno'
import * as Preact from 'preact'
import * as PreactCompat from 'preact/compat'
// import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'

export type Render = (vDom: VDom) => void

export type CreatePortal = (vDom: VDom, container: Element) => VDom

export let createPortal: CreatePortal | null = null

export const Renderer = (vDomImpl: VDomImpl, root: HTMLElement): Render => {
  switch (vDomImpl) {
    case 'inferno': {
      createPortal = Inferno.createPortal
      return function render(vDom) {
        Inferno.render(vDom, root)
      }
    }

    case 'preact': {
      createPortal = PreactCompat.createPortal
      return function render(vDom) {
        Preact.render(vDom, root)
      }
    }

    case 'react':
    case 'react-with-compiler': {
      const reactRoot = ReactDOMClient.createRoot(root)
      createPortal = ReactDOM.createPortal
      return function render(vDom) {
        reactRoot.render(vDom)
      }
    }
  }
}
