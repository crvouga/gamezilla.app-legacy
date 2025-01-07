import { p } from '~/@/parser'
import { isOk } from '~/@/result'
import { Flow } from '.'

const parser = p.brand(p.str, 'FlowHash')

export type FlowHash = p.Infer<typeof parser>

const init = (model: Flow.Model): FlowHash => {
  const terminalHash = Flow.deriveTerminalHash(model.terminalsByGroupId)
  if (is(terminalHash)) {
    return terminalHash
  }
  throw new Error('FlowHash.init: terminalHash is not a FlowHash')
}

const is = (maybeHash: unknown): maybeHash is FlowHash => {
  return isOk(parser.parse(maybeHash))
}

export const FlowHash = {
  ...parser,
  init,
  is,
}
