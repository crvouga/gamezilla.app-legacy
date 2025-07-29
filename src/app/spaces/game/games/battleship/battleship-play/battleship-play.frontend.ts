import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { ModelSpace } from './battleship-play.types'

const View = (input: { modelSpace: ModelSpace }) => {
  return h(Box, {}, [
    h(Box, {}, [h(Text, { text: 'Play' })]),
    ...input.modelSpace.players.map((player) => h(Text, { text: String(player) })),
  ])
}

export const BattleshipPlay = {
  View,
}
