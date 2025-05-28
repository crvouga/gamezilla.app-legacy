import { s } from '~/@/schema'
import * as Flow from './flow'

const schema = s.brand(s.str, 'FlowId')

export type FlowId = s.Infer<typeof schema>

const DIVIDER = '-'

const derive = (flow: Flow.Model): FlowId => {
  const nodeHash = Object.values(flow.nodes)
    .map((node) => node.nodeId)
    .sort()
    .join(DIVIDER)

  const edgeHash = Object.values(flow.edges).map(Flow.toEdgeId).sort().join(DIVIDER)

  const terminalHash = Object.values(flow.terminalsByGroupId)
    .map((terminal) => [terminal.groupId, terminal.startId, terminal.endId].join(DIVIDER))
    .sort()
    .join(DIVIDER)

  const hash = [nodeHash, edgeHash, terminalHash].join(DIVIDER)

  return hash as FlowId
}

export const FlowId = {
  ...schema,
  derive,
}
