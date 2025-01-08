import { p } from '~/@/parser'
import { Pipe } from '../flow/flow'
import { GroupId } from '../flow/group-id'
import { NodeId } from '../flow/node-id'
import { Terminal } from '../flow/terminal'

const parser = p.obj({
  pipesBySourceId: p.dict(NodeId, Pipe),
  terminalsByGroupId: p.partialDict(GroupId, Terminal),
})

export type Solution = p.Infer<typeof parser>

const toPipelineByGroupId = (solution: Solution, groupId: GroupId): Pipe[] => {
  return Object.values(solution.pipesBySourceId).filter((pipe) => pipe.groupId === groupId)
}

export const Solution = {
  ...parser,
  toPipelineByGroupId,
}
