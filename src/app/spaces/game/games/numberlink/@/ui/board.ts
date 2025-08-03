import { IPlatform } from '~/@/platform/platform'
import { GroupId } from '../numberlink/group-id'
import { NodeId } from '../numberlink/node-id'
import type { Edge } from '../numberlink/numberlink'
import { BorderImpl } from './border-impl'

export type BoardProps<TModel> = {
  platform: IPlatform
  disabled?: boolean
  style?: Record<string, unknown>
  model: TModel
  isDragging?: boolean
  impl: BorderImpl
  borderless?: boolean
  disableHighlight?: boolean
  autocompleteEdge?:
    | (Edge & {
        groupId: GroupId
      })
    | null
  showCoordinates?: boolean
  onPressDown?: (nodeId: NodeId) => void
  onPressUp?: (nodeId: NodeId) => void
  onLeave?: () => void
  onDraggedOver?: (nodeId: NodeId) => void
  isGroupActive?: (groupId: GroupId) => boolean
  usedHints?: {
    [groupId in GroupId]?: GroupId
  }
}
