import { ModelSpace } from './battleship-play.types'

const View = (input: { modelSpace: ModelSpace }) => {
  return (
    <div>
      <h1>Play</h1>
      {input.modelSpace.players.map((player) => String(player))}
    </div>
  )
}

export const BattleshipPlay = {
  View,
}
