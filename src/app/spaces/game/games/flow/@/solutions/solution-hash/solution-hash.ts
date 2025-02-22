import { p } from '~/@/parser'
import { isOk } from '~/@/result'
import { Flow } from '../../flow'

const parser = p.brand(p.str, 'SolutionHash')

/**
 * This represents a hash of a flow where its unique on the flow's terminals
 * and edges.
 */
export type SolutionHash = p.Infer<typeof parser>

const init = (model: Flow.Model): SolutionHash => {
  const terminalHash = model.terminalHash ?? Flow.deriveTerminalHash(model.terminalsByGroupId)
  const edgeHash = model.edgeHash ?? Flow.deriveEdgeHash(model.edges)
  const hash = `${terminalHash}-${edgeHash}`

  if (is(hash)) return hash

  throw new Error('SolutionHash.init: hash is not a SolutionHash')
}

const is = (maybeHash: unknown): maybeHash is SolutionHash => {
  return isOk(parser.parse(maybeHash))
}

export const SolutionHash = {
  ...parser,
  init,
  is,
}
