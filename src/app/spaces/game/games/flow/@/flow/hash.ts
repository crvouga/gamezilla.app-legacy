import { p } from '~/@/parser'
import { Flow } from '.'

const parser = p.brand(p.str, 'FlowHash')

export type FlowHash = p.Infer<typeof parser>

const init = (model: Flow.Model): string => {
  const terminalHash = Flow.deriveTerminalHash(model.terminalsByGroupId)
  return String(terminalHash)
}

export const FlowHash = {
  ...parser,
  init,
}
