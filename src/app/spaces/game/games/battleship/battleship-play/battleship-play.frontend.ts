import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { ModelSpace } from './battleship-play.types'

const View = (input: { modelSpace: ModelSpace }) => {
  return h(Box, {}, [
    h(Box, {}, [Text({ text: 'Play' })]),
    ...input.modelSpace.players.map((player) => Text({ text: String(player) })),
  ])
}

export const BattleshipPlay = {
  View,
}
