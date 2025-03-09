import { VDom } from '~/@/vdom/vdom'
import { DropDownAlignment } from './drop-down-alignment'
import { DropDownPosition } from './drop-down-position'

export type DropDownConfig = {
  position?: DropDownPosition
  alignment?: DropDownAlignment
  reference?: VDom
}
