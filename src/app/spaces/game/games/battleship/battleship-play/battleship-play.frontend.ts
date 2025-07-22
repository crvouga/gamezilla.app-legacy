import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { ModelSpace } from './battleship-play.types'

const View = (input: { modelSpace: ModelSpace }) => {
  return h(Box, {}, [h(Box, {}, ['Play']), input.modelSpace.players.map((player) => String(player))])
}

export const BattleshipPlay = {
  View,
}
