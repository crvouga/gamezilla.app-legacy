import { VDom } from "./vdom"

export type VDomImpl = "inferno" | "preact" | "react" | "snabbdom"

export type Render = {
  (vDom: VDom): void
}

export type CreatePortal = (vDom: VDom, container: Element) => VDom

export let createPortal: CreatePortal

export const Render = async (
  vDomImpl: VDomImpl,
  root: HTMLElement,
): Promise<Render> => {
  switch (vDomImpl) {
    case "inferno": {
      const Inferno = await import("inferno")
      createPortal = Inferno.createPortal
      return (vDom) => {
        Inferno.render(vDom, root)
      }
    }

    case "react": {
      const [ReactDOMClient, ReactDOM, React] = await Promise.all([
        import("react-dom/client"),
        import("react-dom"),
        import("react"),
      ])
      const reactRoot = ReactDOMClient.createRoot(root)
      createPortal = ReactDOM.createPortal
      return (vDom) => {
        reactRoot.render(<React.StrictMode>{vDom}</React.StrictMode>)
      }
    }

    case "preact": {
      const [Preact, PreactCompat] = await Promise.all([
        import("preact"),
        import("preact/compat"),
      ])
      createPortal = PreactCompat.createPortal
      return (vDom) => {
        Preact.render(vDom, root)
      }
    }

    case "snabbdom": {
      const Snabbdom = await import("snabbdom")
      const patch = Snabbdom.init([
        Snabbdom.classModule,
        Snabbdom.propsModule,
        Snabbdom.styleModule,
        Snabbdom.eventListenersModule,
      ])
      return (vDom) => {
        patch(root, vDom)
      }
    }
  }
}
