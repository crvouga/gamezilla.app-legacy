import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { type ModelFrontend, type MsgFrontend, initShared } from './battleship.types'
import { Text } from '~/@/vdom/primitives/text'

export const init = initShared

export const View = (_input: { model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  return h(Box, {}, [Text({ text: 'battleship' })])
}
