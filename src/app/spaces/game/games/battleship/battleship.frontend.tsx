import { type MsgFrontend, type ModelFrontend, initShared } from './battleship.types'

export const init = initShared

export const View = (_input: { model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  return <div>battleship</div>
}
