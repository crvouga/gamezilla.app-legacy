import { VDom, VDomChildren } from "gamezilla/@SHARED/vdom"
import { VDOM_IMPL } from "gamezilla/public-config"
import { DrawerReact } from "./drawer-react"
import { PrivateDrawerProps } from "./drawer-shared"
import { DrawerWebComponent } from "./drawer-web-component"

export type DrawerProps = PrivateDrawerProps & {
  children?: VDomChildren
}

export const Drawer = (props: DrawerProps): VDom => {
  switch (VDOM_IMPL) {
    case "react": {
      const USE_THIRD_PARTY = false
      if (USE_THIRD_PARTY) {
        return <DrawerReact {...props} />
      }
      return <DrawerWebComponent {...props} />
    }

    default: {
      return <DrawerWebComponent {...props} />
    }
  }
}
