import { h } from '~/@/vdom/h'
import { ModelSpace } from './battleship-play.types'

const View = (input: { modelSpace: ModelSpace }) => {
  return h('div', null, [h('h1', null, ['Play']), input.modelSpace.players.map((player) => String(player))])
}

export const BattleshipPlay = {
  View,
}
