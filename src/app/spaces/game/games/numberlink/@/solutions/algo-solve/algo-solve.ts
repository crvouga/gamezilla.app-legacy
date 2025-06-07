import { ascend } from '~/@/array/sorting'
import { Numberlink } from '../../numberlink'
import { Terminal } from '../../numberlink/terminal'
import { TerminalFull } from '../../numberlink/terminal-full'
import { NumberlinkVariant } from '../../variant'
import { AlgoIsSolved } from '../algo-is-solved/algo-is-solved'
import { toAllPossiblePipelines } from './algo-all-possible-pipelines'
import { isImpossibleForAnyTerminalToConnect } from './algo-is-impossible-for-terminals-to-connect'

export const solve = (model: NumberlinkVariant.Model): NumberlinkVariant.Model | null => {
  for (const solution of solutions(model)) {
    return solution
  }
  return null
}

export const solutions = function* (model: NumberlinkVariant.Model): Iterable<NumberlinkVariant.Model> {
  const cleared = Numberlink.removeAllPipelines(model)

  const disconnectedTerminals = Numberlink.toFullTerminals(cleared)
  disconnectedTerminals.sort(ascend((terminal) => NumberlinkVariant.toTerminalDistance(cleared, terminal)))

  yield* solveStep(cleared, disconnectedTerminals)
}

const solveStep = function* (
  model: NumberlinkVariant.Model,
  disconnectedTerminals: TerminalFull[],
): Iterable<NumberlinkVariant.Model> {
  if (isImpossibleForAnyTerminalToConnect(model, disconnectedTerminals)) {
    return
  }

  if (AlgoIsSolved.isSolved(model)) {
    yield model
    return
  }

  const [terminal, ...rest] = disconnectedTerminals

  if (!terminal) return

  const allPossiblePipelines = toAllPossiblePipelines({
    model,
    groupId: terminal.groupId,
    startId: terminal.startId,
    endId: terminal.endId,
  })

  for (const possiblePipeline of allPossiblePipelines) {
    const drew = drawPipeline(model, terminal, possiblePipeline)
    yield* solveStep(drew, rest)
  }
}

const drawPipeline = (
  model: NumberlinkVariant.Model,
  terminal: Terminal,
  path: Numberlink.Edge[],
): NumberlinkVariant.Model => {
  const pipesBySourceId = { ...model.pipesBySourceId }

  for (const edge of path) {
    pipesBySourceId[edge.sourceId] = {
      edgeId: Numberlink.toEdgeId(edge),
      groupId: terminal.groupId,
    }
  }

  return {
    ...model,
    pipesBySourceId,
  }
}
