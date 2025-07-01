import type { Edge } from '../numberlink/numberlink'
import { GroupId } from '../numberlink/group-id'
import { NodeId } from '../numberlink/node-id'

export type BoardInput<TModel> = {
  disabled?: boolean
  class?: string
  model: TModel
  isDragging?: boolean
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
