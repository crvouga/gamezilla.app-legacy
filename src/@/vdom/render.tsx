import type { VDom } from './vdom'
import type { VDomImpl } from './vdom-impl'

export type Render = (vDom: VDom) => void

export type CreatePortal = (vDom: VDom, container: Element) => VDom

export let createPortal: CreatePortal | null = null

export const Renderer = async (vDomImpl: VDomImpl, root: HTMLElement): Promise<Render> => {
  switch (vDomImpl) {
    case 'inferno': {
      // @ts-expect-error
      const Inferno = await import('inferno')
      createPortal = Inferno.createPortal
      return function render(vDom) {
        Inferno.render(vDom, root)
      }
    }

    case 'preact': {
      const [Preact, PreactCompat] = await Promise.all([import('preact'), import('preact/compat')])
      createPortal = PreactCompat.createPortal
      return function render(vDom) {
        Preact.render(vDom, root)
      }
    }

    case 'react':
    case 'react-with-compiler': {
      const [ReactDOMFrontend, ReactDOM, _React] = await Promise.all([
        import('react-dom/client'),
        import('react-dom'),
        import('react'),
      ])
      const reactRoot = ReactDOMFrontend.createRoot(root)
      createPortal = ReactDOM.createPortal
      return function render(vDom) {
        reactRoot.render(vDom)
      }
    }
  }
}
