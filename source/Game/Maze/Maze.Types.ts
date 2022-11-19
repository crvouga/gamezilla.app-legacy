import { Result, Set } from "../../Core"
import { Err, Ok } from "../../Core/Result"
import { UserId } from "../../Data"

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

type Player = { userId: UserId; position: Position }

type Position = { x: number, y: number }

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

export type Direction = "North" | "South" | "East" | "West"

export type Res = [...Req, Result<Problem, SharedModel>]

type Problem = "must_be_setup" | "already_playing" | "must_have_at_least_one_player" | "must_be_playing" | "must_be_game"

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
              position: { x: 0, y: 0 }
            }
          }),
            {}
          )

      const modelNew: SharedModel = {
        type: "Game",
        colors: model.colors,
        maze: initMaze({ columnCount: 20, rowCount: 20 }),
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



      return Ok(model)
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