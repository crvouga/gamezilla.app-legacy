import { Set } from "gamezilla-app/@SHARED/core"
import { Pos2d } from "../pos-2d/pos-2d"

export type Model<TPlayerType extends string> = {
  water: Set<Pos2d>
  players: {
    [player in TPlayerType]?: Player<TPlayerType>
  }
}

export const init = <TPlayerType extends string>(
  allPlayerTypes: readonly TPlayerType[],
): Model<TPlayerType> => {
  return {
    water: Set.empty(),
    players: allPlayerTypes.reduce<Model<TPlayerType>["players"]>(
      (acc, player) => {
        return {
          ...acc,
          [player]: initPlayer(player),
        }
      },
      {},
    ),
  }
}

type Ship = {
  name: string
  positions: Set<Pos2d>
}

export const submarine = (): Ship => {
  return {
    name: "submarine",
    positions: Set.from(
      (pos) => `${pos.x},${pos.y}`,
      [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ],
    ),
  }
}

type Player<TPlayerType extends string> = {
  playerType: TPlayerType
  ships: Ship[]
  shots: {
    [player in TPlayerType]?: Set<Pos2d>
  }
}

const initPlayer = <TPlayerType extends string>(
  allPlayerTypes: TPlayerType,
): Player<TPlayerType> => {
  return {
    playerType: allPlayerTypes,
    ships: [],
    shots: {},
  }
}

export const placeShip = <TPlayerType extends string>(
  model: Model<TPlayerType>,
  _player: TPlayerType,
  _ship: Ship,
): Model<TPlayerType> => {
  return {
    ...model,
    players: {
      ...model.players,
    },
  }
}

export const listShips = <TPlayerType extends string>(
  _model: Model<TPlayerType>,
  _player: TPlayerType,
): Ship[] => {
  return []
}
