import { v } from '~/@/vdom/v'
import { type ModelFrontend, type MsgFrontend, initShared } from './battleship.types'

export const init = initShared

export const View = (_input: { model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  return v('div', null, ['battleship'])
}
