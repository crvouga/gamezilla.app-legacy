import { Result, Set } from "../../Core"
import { Err, Ok } from "../../Core/Result"
import { UserId } from "../../Data"
import { Direction } from "./Direction"
import { Position } from "./Position"

//
//
//
// Model
//
//
//

export type SharedModel = SetupModel

export type SetupModel =
  | {
    type: "Setup"
    players: Set<UserId>,
    colors: ColorMap
  }
  | {
    type: "Game",
    players: { [userId: UserId]: Player }
    colors: ColorMap
    maze: Maze
  }

type ColorMap = { [color in Color]?: UserId }

type Player = {
  userId: UserId;
  position: Position
  direction: Direction | "None"
}

type Color = "Red" | "Blue" | "Green" | "Purple"


// const colorSequence: Color[] = ['Red', 'Blue', "Green", "Purple"]

export type FrontendModel = SharedModel

export type BackendModel = SharedModel

export type Maze = Cell[][]

export type Cell = {
  hasTop: boolean
  hasLeft: boolean
}

export const generateMaze = () => { }

// 
// 
// 
// Msg
// 
// 
// 

export type FrontendMsg = Req

export type BackendMsg = ['None']

export type ToBackend = Req

export type ToFrontend = Res

// 
// 
// 
// 

export type Req =
  | ['StartPlaying', { userId: UserId }]
  | ['StopPlaying', { userId: UserId }]
  | ['StartGame', { userId: UserId }]
  | ['InputMove', { userId: UserId, direction: Direction }]

export type Res = [...Req, Result<Problem, SharedModel>]

type Problem =
  | "must_be_setup"
  | "already_playing"
  | "must_have_at_least_one_player"
  | "must_be_playing"
  | "must_be_game"
  | "out_of_bounds"

export const handle = (msg: Req, model: SharedModel): Result<Problem, SharedModel> => {
  switch (msg[0]) {
    case 'StartPlaying': {
      if (model.type !== 'Setup') {
        return Err("must_be_setup")
      }

      if (Set.isMember(msg[1].userId, model.players)) {
        return Err("already_playing")
      }

      const modelNew: SharedModel = {
        ...model,
        players: Set.add(msg[1].userId, model.players)
      }
      return Ok(modelNew)
    }

    case 'StopPlaying': {
      if (model.type !== 'Setup') {
        return Err("must_be_setup")
      }

      const modelNew: SharedModel = {
        ...model,
        players: Set.remove(msg[1].userId, model.players)
      }

      return Ok(modelNew)
    }

    case 'StartGame': {
      if (model.type !== 'Setup') {
        return Err("must_be_setup")
      }

      if (Object.values(model.players).length === 0) {
        return Err("must_have_at_least_one_player")
      }

      const playersNew: { [userId: UserId]: Player } =
        Set.toArray(model.players)
          .reduce<{ [userId: UserId]: Player }>((byId, userId) => ({
            ...byId,
            [userId]: {
              userId,
              position: { x: 0, y: 0 },
              direction: "None"
            }
          }),
            {}
          )

      const modelNew: SharedModel = {
        type: "Game",
        colors: model.colors,
        maze: initMaze({ columnCount: 10, rowCount: 10 }),
        players: playersNew

      }

      return Ok(modelNew)
    }

    case 'InputMove': {
      if (model.type !== 'Game') {
        return Err("must_be_game")
      }

      const player = model.players[msg[1].userId]

      if (!player) {
        return Err("must_be_playing")
      }

      const positionNew = Position.add(
        Direction.toVector(msg[1].direction),
        player.position,
      )

      const isInbounds =
        0 <= positionNew.x && positionNew.x < model.maze.length &&
        0 <= positionNew.y && positionNew.y < (model.maze?.[0]?.length ?? 0)

      if (!isInbounds) {
        return Err("out_of_bounds")
      }

      const playerNew: Player = {
        ...player,
        position: positionNew
      }

      const modelNew: SharedModel = {
        type: "Game",
        colors: model.colors,
        maze: model.maze,
        players: { ...model.players, [playerNew.userId]: playerNew },
      }


      return Ok(modelNew)
    }
  }
}

//
//
//
// Init
//
//
//



export const initMaze = ({
  columnCount,
  rowCount,
}: {
  columnCount: number
  rowCount: number
}): Maze => {
  const maze: Cell[][] = []

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    const column: Cell[] = []

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      column.push({ hasLeft: true, hasTop: true })
    }

    maze.push(column)
  }

  return maze
}

export const initShared: SharedModel = {
  type: "Setup",
  players: {},
  colors: {}
}