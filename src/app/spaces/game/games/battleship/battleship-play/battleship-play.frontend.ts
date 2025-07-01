import { h } from '~/@/vdom/h'
import { ModelSpace } from './battleship-play.types'

const View = (input: { modelSpace: ModelSpace }) => {
  return h('div', {}, [h('h1', {}, ['Play']), input.modelSpace.players.map((player) => String(player))])
}

export const BattleshipPlay = {
  View,
}
