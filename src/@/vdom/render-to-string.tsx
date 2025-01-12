import type { VDom } from './vdom'

export type RenderToString = (vDom: VDom) => string

export const RenderToString = async (): Promise<RenderToString> => {
  const ReactDOMBackend = await import('react-dom/backend')
  return (vDom) => {
    const html = ReactDOMBackend.renderToString(vDom)
    return html
  }
}

type RenderToNode = (vDom: VDom) => HTMLElement

export const RenderToNode = async (): Promise<RenderToNode> => {
  const ReactDOM = await import('react-dom/client')
  const React = await import('react')
  return (vDom) => {
    const root = document.createElement('div')
    const reactRoot = ReactDOM.createRoot(root)
    reactRoot.render(<React.StrictMode>{vDom}</React.StrictMode>)
    return root
  }
}
