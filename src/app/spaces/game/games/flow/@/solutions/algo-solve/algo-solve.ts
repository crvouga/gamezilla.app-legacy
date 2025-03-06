import { ascend } from '~/@/array/sorting'
import { Flow } from '../../flow'
import { Terminal } from '../../flow/terminal'
import { TerminalFull } from '../../flow/terminal-full'
import { Variant } from '../../variant'
import { AlgoIsSolved } from '../algo-is-solved/algo-is-solved'
import { toAllPossiblePipelines } from './algo-all-possible-pipelines'
import { isImpossibleForTerminalsToConnect } from './algo-is-impossible-for-terminals-to-connect'

export const solve = (model: Variant.Model): Variant.Model | null => {
  for (const solution of solutions(model)) {
    return solution
  }
  return null
}

export const solutions = function* (model: Variant.Model): Iterable<Variant.Model> {
  const cleared = Flow.removeAllPipelines(model)

  const disconnectedTerminals = Flow.toFullTerminals(cleared)
  disconnectedTerminals.sort(ascend((terminal) => Variant.toTerminalDistance(cleared, terminal)))

  yield* solveStep(cleared, disconnectedTerminals)
}

const solveStep = function* (model: Variant.Model, disconnectedTerminals: TerminalFull[]): Iterable<Variant.Model> {
  if (isImpossibleForTerminalsToConnect(model, disconnectedTerminals)) {
    return
  }

  if (AlgoIsSolved.isSolved(model)) {
    yield model
    return
  }

  const [terminal, ...rest] = disconnectedTerminals

  if (!terminal) return

  const allPossiblePipelines = toAllPossiblePipelines(model, terminal.groupId, terminal.startId, terminal.endId)

  for (const possiblePipeline of allPossiblePipelines) {
    const drew = drawPipeline(model, terminal, possiblePipeline)
    yield* solveStep(drew, rest)
  }
}

const drawPipeline = (model: Variant.Model, terminal: Terminal, path: Flow.Edge[]): Variant.Model => {
  const pipesBySourceId = { ...model.pipesBySourceId }

  for (const edge of path) {
    pipesBySourceId[edge.sourceId] = {
      edgeId: Flow.toEdgeId(edge),
      groupId: terminal.groupId,
    }
  }

  return {
    ...model,
    pipesBySourceId,
  }
}
