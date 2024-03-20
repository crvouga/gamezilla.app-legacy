import { z } from "zod"
import * as Flow from "./flow"

export const NodeId = z.custom<Flow.NodeId>(Flow.isNodeId)

export const GroupId = z.enum(Flow.GROUP_ID_ORDER)

export const Node: z.ZodType<Flow.Node> = z.object({
  nodeId: NodeId,
})

export const Terminal: z.ZodType<Flow.Terminal> = z.object({
  groupId: GroupId,
  startId: NodeId,
  endId: NodeId.nullish(),
})
