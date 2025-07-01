import * as Inferno from 'inferno'
import { ParentDOM } from 'inferno'
import * as Preact from 'preact'
import * as PreactCompat from 'preact/compat'
import * as ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'
import type { VDom } from './vdom'
import type { VDomImpl } from './vdom-impl'

export type RenderNode = Element | HTMLBodyElement | HTMLElement

export type Render = (vDom: VDom) => void

export type CreatePortal = (vDom: VDom, container: RenderNode) => VDom

export let createPortal: CreatePortal | null = null

export const Render = (vDomImpl: VDomImpl, node: RenderNode): Render => {
  switch (vDomImpl) {
    case 'inferno': {
      createPortal = Inferno.createPortal as CreatePortal
      return (vDom) => {
        Inferno.render(vDom, node as unknown as ParentDOM)
      }
    }

    case 'preact': {
      createPortal = PreactCompat.createPortal as CreatePortal
      return (vDom) => {
        Preact.render(vDom, node)
      }
    }

    case 'react': {
      const reactRoot = ReactDOMClient.createRoot(node)
      createPortal = ReactDOM.createPortal
      return (vDom) => {
        reactRoot.render(vDom)
      }
    }
  }
}
