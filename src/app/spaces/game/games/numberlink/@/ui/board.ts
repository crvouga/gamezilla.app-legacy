import { IPlatform } from '~/@/platform/platform'
import { GroupId } from '../numberlink/group-id'
import { NodeId } from '../numberlink/node-id'
import type { Edge } from '../numberlink/numberlink'

export type BoardInput<TModel> = {
  platform: IPlatform
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
  onPress?: (nodeId: NodeId) => void
  onPressOut?: (nodeId: NodeId) => void
  onLeave?: () => void
  onDraggedOver?: (nodeId: NodeId) => void
  isGroupActive?: (groupId: GroupId) => boolean
  usedHints?: {
    [groupId in GroupId]?: GroupId
  }
}
