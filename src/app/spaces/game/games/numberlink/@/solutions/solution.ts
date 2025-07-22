import { s } from '~/@/schema'
import { UnixMs } from '~/@/time/unix-ms'
import { Numberlink } from '../numberlink'
import { GroupId } from '../numberlink/group-id'
import { Pipe } from '../numberlink/numberlink'

const schema = s.and(
  Numberlink.Model,
  s.obj({
    lastUpdatedAt: UnixMs,
  }),
)

export type Solution = s.Infer<typeof schema>

const toPipelineByGroupId = (solution: Solution, groupId: GroupId): Pipe[] => {
  return Object.values(solution.pipesBySourceId).filter((pipe) => pipe.groupId === groupId)
}

const fromNumberlink = (model: Numberlink.Model): Solution => {
  return {
    edgeHash: model.edgeHash,
    nodeHash: model.nodeHash,
    pipesBySourceId: model.pipesBySourceId,
    edges: model.edges,
    Flow: true,
    nodes: model.nodes,
    terminalsByGroupId: model.terminalsByGroupId,
    terminalHash: model.terminalHash,
    lastUpdatedAt: UnixMs.now(),
  }
}

const toSolvedNumberlink = (solution: Solution): Numberlink.Model => {
  return {
    ...solution,
    pipesBySourceId: solution.pipesBySourceId,
    terminalsByGroupId: solution.terminalsByGroupId,
  }
}

const key = (key: keyof Solution) => key

export const Solution = {
  ...schema,
  toPipelineByGroupId,
  fromNumberlink,
  toSolvedNumberlink,
  key,
}
