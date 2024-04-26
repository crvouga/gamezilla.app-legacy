import { VDom } from "./vdom"
import { VDomImpl } from "./vdom-impl"

export type RenderToString = {
  (vDom: VDom): string
}

export const RenderToString = async (
  vDomImpl: VDomImpl,
): Promise<RenderToString> => {
  switch (vDomImpl) {
    case "inferno": {
      const InfernoServer = await import("inferno-server")

      return (vDom) => {
        return InfernoServer.renderToString(vDom)
      }
    }

    case "react": {
      const ReactDOMServer = await import("react-dom/server")

      return (vDom) => {
        return ReactDOMServer.renderToString(vDom)
      }
    }

    case "preact": {
      const { renderToString } = await import("preact-render-to-string")

      return (vDom) => {
        return renderToString(vDom)
      }
    }

    case "snabbdom": {
      return (_vDom) => {
        return ""
      }
    }

    case "custom-jsx": {
      return (_vDom) => {
        return ""
      }
    }
  }
}
