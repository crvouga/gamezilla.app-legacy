import { type MsgClient, type ModelClient, initShared } from './battleship.types'

export const init = initShared

export const View = (_input: { model: ModelClient; dispatch: (msg: MsgClient) => void }) => {
  return <div>battleship</div>
}
