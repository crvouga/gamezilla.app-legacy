import { VDom } from "./vdom"

export type VDomImpl = "inferno" | "preact" | "react"

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
      const ReactDOMClient = await import("react-dom/client")
      const ReactDOM = await import("react-dom")

      const React = await import("react")

      const reactRoot = ReactDOMClient.createRoot(root)
      createPortal = ReactDOM.createPortal

      return (vDom) => {
        reactRoot.render(<React.StrictMode>{vDom}</React.StrictMode>)
      }
    }

    case "preact": {
      const Preact = await import("preact")
      const PreactCompat = await import("preact/compat")

      createPortal = PreactCompat.createPortal

      return (vDom) => {
        Preact.render(vDom, root)
      }
    }
  }
}
