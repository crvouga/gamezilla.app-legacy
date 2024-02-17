import { VDom } from "./vdom"

export type VDomImpl = "inferno" | "preact" | "react" | "react-with-million"

export type Render = {
  (vDom: VDom, root: HTMLElement): Promise<void>
}

export type CreatePortal = (vDom: VDom, container: Element) => VDom

export let createPortal: CreatePortal

export const Render = async (vDomImpl: VDomImpl): Promise<Render> => {
  switch (vDomImpl) {
    case "inferno": {
      const Inferno = await import("inferno")
      createPortal = Inferno.createPortal
      return async (vDom, root) => {
        Inferno.render(vDom, root)
      }
    }

    case "react-with-million":
    case "react": {
      const ReactDOMClient = await import("react-dom/client")
      const ReactDOM = await import("react-dom")

      await import("react")

      let reactRoot: ReturnType<typeof ReactDOMClient.createRoot>

      createPortal = ReactDOM.createPortal

      return async (vDom, root) => {
        if (!reactRoot) {
          reactRoot = ReactDOMClient.createRoot(root)
        }
        reactRoot.render(vDom)
      }
    }

    case "preact": {
      const Preact = await import("preact")
      const PreactCompat = await import("preact/compat")

      createPortal = PreactCompat.createPortal

      return async (vDom, root) => {
        Preact.render(vDom, root)
      }
    }
  }
}
