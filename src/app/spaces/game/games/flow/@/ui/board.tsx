import type { Edge } from '../flow/flow'
import { FlowGroupId } from '../flow/group-id'
import { FlowNodeId } from '../flow/node-id'

export type BoardInput<TModel> = {
  disabled?: boolean
  className?: string
  model: TModel
  isDragging?: boolean
  borderless?: boolean
  disableHighlight?: boolean
  autocompleteEdge?:
    | (Edge & {
        groupId: FlowGroupId
      })
    | null
  showCoordinates?: boolean
  onPressDown?: (nodeId: FlowNodeId) => void
  onPressUp?: (nodeId: FlowNodeId) => void
  onLeave?: () => void
  onDraggedOver?: (nodeId: FlowNodeId) => void
  isGroupActive?: (groupId: FlowGroupId) => boolean
  usedHints?: {
    [groupId in FlowGroupId]?: FlowGroupId
  }
}
