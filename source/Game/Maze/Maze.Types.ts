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

export type SetupModel = {
  type: "Setup"
  players: Set<UserId>
}

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

export type Req = ['StartPlaying', { userId: UserId }]

export type Res = [...Req, Result<Problem, SharedModel>]

type Problem = "must_be_setup"

export const handle = (msg: Req, model: SharedModel): Result<Problem, SharedModel> => {
  switch (msg[0]) {
    case 'StartPlaying': {
      if (model.type !== 'Setup') {
        return Err("must_be_setup")
      }

      const modelNew: SharedModel = {
        ...model,
        players: Set.add(msg[1].userId, model.players)
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
}