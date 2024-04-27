import { VDomChildren } from "gamezilla-app/@SHARED/vdom"
import { VDOM_IMPL } from "gamezilla-app/public-config"

export const Watch = ({ children }: { children: VDomChildren }) => {
  switch (VDOM_IMPL) {
    case "custom-jsx": {
      return <>{children}</>
    }
    case "inferno": {
      return <>{children}</>
    }
    case "preact": {
      return <>{children}</>
    }
    case "react": {
      return <>{children}</>
    }
    case "snabbdom": {
      return <>{children}</>
    }
  }
}
