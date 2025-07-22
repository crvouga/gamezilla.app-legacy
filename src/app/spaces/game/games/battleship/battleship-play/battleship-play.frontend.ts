import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/box'
import { ModelSpace } from './battleship-play.types'

const View = (input: { modelSpace: ModelSpace }) => {
  return h(Box, {}, [h('h1', {}, ['Play']), input.modelSpace.players.map((player) => String(player))])
}

export const BattleshipPlay = {
  View,
}
