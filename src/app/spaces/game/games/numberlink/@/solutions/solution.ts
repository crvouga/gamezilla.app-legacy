import { s } from '~/@/schema'
import { Numberlink } from '../numberlink'
import { Pipe } from '../numberlink/numberlink'
import { GroupId } from '../numberlink/group-id'

const schema = Numberlink.Model

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
  }
}

const toSolvedNumberlink = (solution: Solution): Numberlink.Model => {
  return {
    ...solution,
    pipesBySourceId: solution.pipesBySourceId,
    terminalsByGroupId: solution.terminalsByGroupId,
  }
}

export const Solution = {
  ...schema,
  toPipelineByGroupId,
  fromNumberlink,
  toSolvedNumberlink,
}
