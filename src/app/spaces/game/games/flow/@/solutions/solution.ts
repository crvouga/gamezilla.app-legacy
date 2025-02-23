import { p } from '~/@/parser'
import { Flow } from '../flow'
import { Pipe } from '../flow/flow'
import { GroupId } from '../flow/group-id'

const parser = Flow.Model

export type Solution = p.Infer<typeof parser>

const toPipelineByGroupId = (solution: Solution, groupId: GroupId): Pipe[] => {
  return Object.values(solution.pipesBySourceId).filter((pipe) => pipe.groupId === groupId)
}

const fromFlow = (model: Flow.Model): Solution => {
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

export const Solution = {
  ...parser,
  toPipelineByGroupId,
  fromFlow,
}
