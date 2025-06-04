import { Msg } from '~/@/msg/msg'
import type { ProgramDebugger } from '../program'

export const DebuggerConsole: ProgramDebugger = (initialModel, setModel) => {
  console.log('[Debugger]: initialModel', initialModel, '\n')
  window.setModel = setModel
  return async (model, msg) => {
    console.log('[Debugger]', Msg.toType(msg), Msg.toPayload(msg), msg, model, '\n')
  }
}

declare global {
  interface Window {
    setModel: (model: unknown) => void
  }
}
