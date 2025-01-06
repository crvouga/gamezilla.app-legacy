import type { Edge } from '../flow/flow'
import { GroupId } from '../flow/group-id'
import { NodeId } from '../flow/node-id'

export type BoardInput<TModel> = {
  disabled?: boolean
  className?: string
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
