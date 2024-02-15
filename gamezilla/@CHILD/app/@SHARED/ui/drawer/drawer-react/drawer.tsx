import { VDom } from "gamezilla/@SHARED/vdom"
import { DrawerProps } from ".."

export const DrawerReact = (props: DrawerProps): VDom => {
  return <div>{props.children}</div>
}
