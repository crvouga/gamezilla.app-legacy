import { v } from '~/@/vdom/v'
import { ModelSpace } from './battleship-play.types'

const View = (input: { modelSpace: ModelSpace }) => {
  return v('div', {}, [v('h1', {}, ['Play']), input.modelSpace.players.map((player) => String(player))])
}

export const BattleshipPlay = {
  View,
}
