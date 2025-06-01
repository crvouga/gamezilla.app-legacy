import type { VDom } from './vdom'
import type { VDomImpl } from './vdom-impl'

export type Render = (vDom: VDom) => void

export type CreatePortal = (vDom: VDom, container: Element) => VDom

export let createPortal: CreatePortal | null = null

export const Render = async (config: { vDomImpl: VDomImpl; node: HTMLElement }): Promise<Render> => {
  switch (config.vDomImpl) {
    case 'inferno': {
      const Inferno = await import('inferno')
      // @ts-expect-error We're using react types of vdom
      createPortal = Inferno.createPortal
      return (vDom) => {
        Inferno.render(vDom, config.node)
      }
    }

    case 'preact': {
      const [Preact, PreactCompat] = await Promise.all([import('preact'), import('preact/compat')])
      // @ts-expect-error We're using react types of vdom
      createPortal = PreactCompat.createPortal
      return (vDom) => {
        Preact.render(vDom, config.node)
      }
    }

    case 'react':
    case 'react-with-compiler': {
      const [React, ReactDOM, ReactDOMClient] = await Promise.all([
        import('react'),
        import('react-dom'),
        import('react-dom/client'),
      ])
      const reactRoot = ReactDOMClient.createRoot(config.node)
      createPortal = ReactDOM.createPortal
      return (vDom) => {
        reactRoot.render(<React.StrictMode>{vDom}</React.StrictMode>)
      }
    }
  }
}
