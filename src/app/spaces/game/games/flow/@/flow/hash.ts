import { p } from '~/@/parser'
import { isOk } from '~/@/result'
import { Flow } from '.'

const parser = p.brand(p.str, 'FlowHash')

/**
 * This represents a hash of a flow where its unique on the flow's terminals
 */
export type FlowHash = p.Infer<typeof parser>

const init = (model: Flow.Model): FlowHash => {
  const terminalHash = Flow.deriveTerminalHash(model.terminalsByGroupId)
  const edgeHash = Flow.deriveEdgeHash(model.edges)
  const hash = `${terminalHash}-${edgeHash}`
  if (is(hash)) {
    return hash
  }
  throw new Error('FlowHash.init: hash is not a FlowHash')
}

const is = (maybeHash: unknown): maybeHash is FlowHash => {
  return isOk(parser.parse(maybeHash))
}

export const FlowHash = {
  ...parser,
  init,
  is,
}
