import { PUBLIC_APP_CONFIG } from "config";
import * as Inferno from "inferno";
import * as Preact from "preact/compat";
import * as ReactDOM from "react-dom";
import { VDom } from "../ui";

export type CreatePortal = (vDom: VDom, container: Element) => VDom;

const getCreatePortal = (): CreatePortal => {
  switch (PUBLIC_APP_CONFIG.RENDERER_IMPL) {
    case "inferno": {
      return Inferno.createPortal;
    }
    case "preact": {
      return Preact.createPortal;
    }

    case "react-with-million":
    case "react": {
      return ReactDOM.createPortal;
    }
  }
};

export const createPortal = getCreatePortal();
