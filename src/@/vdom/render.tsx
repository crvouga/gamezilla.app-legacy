import { setCreatePortal } from './create-portal'
import type { VDom } from './vdom'
import type { VDomImpl } from './vdom-impl'

export type Render = (vDom: VDom) => void

export const Render = async (vDomImpl: VDomImpl, root: HTMLElement): Promise<Render> => {
  switch (vDomImpl) {
    case 'inferno': {
      const Inferno = await import('inferno')
      setCreatePortal(Inferno.createPortal)
      return (vDom) => {
        Inferno.render(vDom, root)
      }
    }

    case 'react-with-compiler':
    case 'react': {
      const [ReactDOMClient, ReactDOM, React] = await Promise.all([
        import('react-dom/client'),
        import('react-dom'),
        import('react')
      ])
      const reactRoot = ReactDOMClient.createRoot(root)
      setCreatePortal(ReactDOM.createPortal)
      return (vDom) => {
        reactRoot.render(<React.StrictMode>{vDom}</React.StrictMode>)
      }
    }

    case 'preact': {
      const [Preact, PreactCompat] = await Promise.all([import('preact'), import('preact/compat')])
      setCreatePortal(PreactCompat.createPortal)
      return (vDom) => {
        Preact.render(vDom, root)
      }
    }
  }
}
