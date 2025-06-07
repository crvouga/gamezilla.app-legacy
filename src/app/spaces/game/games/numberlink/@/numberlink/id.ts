import { s } from '~/@/schema'
import * as Numberlink from './numberlink'

const schema = s.brand(s.str(), 'Id')

export type Id = s.Infer<typeof schema>

const DIVIDER = '-'

const derive = (numberlink: Numberlink.Model): Id => {
  const nodeHash = Object.values(numberlink.nodes)
    .map((node) => node.nodeId)
    .sort()
    .join(DIVIDER)

  const edgeHash = Object.values(numberlink.edges).map(Numberlink.toEdgeId).sort().join(DIVIDER)

  const terminalHash = Object.values(numberlink.terminalsByGroupId)
    .map((terminal) => [terminal.groupId, terminal.startId, terminal.endId].join(DIVIDER))
    .sort()
    .join(DIVIDER)

  const hash = [nodeHash, edgeHash, terminalHash].join(DIVIDER)

  return hash as Id
}

export const Id = {
  ...schema,
  derive,
}
