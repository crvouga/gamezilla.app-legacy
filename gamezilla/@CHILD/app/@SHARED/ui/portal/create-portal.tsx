import { PUBLIC_APP_CONFIG } from "config"
import { VDom } from "../ui"

export type CreatePortal = (vDom: VDom, container: Element) => VDom

export let createPortal: CreatePortal

const getCreatePortal = async (): Promise<CreatePortal> => {
  switch (PUBLIC_APP_CONFIG.RENDERER_IMPL) {
    case "inferno": {
      const Inferno = await import("inferno")
      return Inferno.createPortal
    }
    case "preact": {
      const Preact = await import("preact/compat")
      return Preact.createPortal
    }

    case "react-with-million":
    case "react": {
      const ReactDOM = await import("react-dom")
      return ReactDOM.createPortal
    }
  }
}

getCreatePortal().then((createPortalNew) => {
  createPortal = createPortalNew
})
