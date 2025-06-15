import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { Numberlink } from '../../numberlink'

const schema = s.brand(s.str(), 'SolutionHash')

/**
 * This represents a hash of a numberlink where its unique on the terminals and edges.
 */
export type SolutionHash = s.Infer<typeof schema>

const init = (model: Numberlink.Model): SolutionHash => {
  const terminalHash = model.terminalHash ?? Numberlink.deriveTerminalHash(model.terminalsByGroupId)
  const edgeHash = model.edgeHash ?? Numberlink.deriveEdgeHash(model.edges)
  const hash = `${terminalHash}-${edgeHash}`
  if (is(hash)) return hash

  throw new Error('SolutionHash.init: hash is not a SolutionHash')
}

const is = (maybeHash: unknown): maybeHash is SolutionHash => {
  return isOk(schema.parse(maybeHash))
}

export const SolutionHash = {
  ...schema,
  init,
  is,
}
