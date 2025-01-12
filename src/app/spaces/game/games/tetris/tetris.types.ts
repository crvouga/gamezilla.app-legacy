import { Keyboard } from '~/@/browser'
import { Result } from '~/@/result'
import { Option } from '~/@/option/option'
import * as Board from './@/board'
import * as Direction from './@/direction'
import * as Piece from './@/piece'
import * as Position from './@/position'

const { Err, Ok } = Result

//
//
//
// Model
//
//
//

export type ModelFrontend = {
  touched: Option<Position.Position>
  spaceModel: SpaceModel
}

export type ModelBackend = SpaceModel

export type SpaceModel = {
  board: Board.Board
  origin: Position.Position
  tetrominoName: Piece.Name
  rotations: 0 | 1 | 2 | 3
}

export const columnCount = 10

export const rowCount = 20

const initialOrigin: Position.Position = {
  x: Math.floor(columnCount / 2),
  y: 0,
}

export const initShared: SpaceModel = {
  board: Board.init({ rowCount, columnCount }),
  origin: initialOrigin,
  tetrominoName: 'Z',
  rotations: 0,
}

export const toPiece = (model: SpaceModel): Piece.Piece => {
  return Piece.toUnit(model.tetrominoName)
    .map((position) => times(model.rotations, Position.rotate, position))
    .map((position) => Position.add(position, model.origin))
}

const times = <X>(count: number, f: (x: X) => X, x: X): X => {
  if (count <= 0) {
    return x
  }
  return times(count - 1, f, f(x))
}

export const inCollision = (model: SpaceModel): boolean => {
  return toPiece(model).some((position) => Board.toCell(position, model.board) !== 'Empty') || isOutOfBounds(model)
}

export const isOutOfBounds = (model: SpaceModel): boolean => {
  return toPiece(model).some((position) => position.x >= columnCount || position.x < 0 || position.y >= rowCount)
}

export const toDrop = (model: SpaceModel): SpaceModel => {
  const modelNext: SpaceModel = {
    ...model,
    origin: Position.add(Direction.toPosition('Down'), model.origin),
  }

  if (inCollision(modelNext)) {
    return model
  }

  return toDrop(modelNext)
}

export const toGhostPiece = (model: SpaceModel): Piece.Piece => {
  return toPiece(toDrop(model))
}

//
//
//
// Msg
//
//
//

export type MsgFrontend =
  | ['PressedKey', Keyboard.Key]
  | ['TouchStart', Position.Position]
  | ['TouchMove', Position.Position]
  | ['TouchEnd', Position.Position]
  | ['ClickedBoard', Position.Position]
  | MouseMove

export type MsgBackend = Tick

export type MsgToBackend = InputTranslate | InputRotate | InputDrop | MouseMove

export type MsgToFrontend = Tick_Done | InputTranslate_Done | InputRotate_Done | InputDrop_Done | MouseMove_Done

//
//
//
//
//
//
//

export type MouseMove = ['MouseMove', Position.Position]
export type MouseMove_Done = ['MouseMove_Done', Result<'collision', SpaceModel>]

export const mouseMove = (msg: MouseMove, model: SpaceModel): MouseMove_Done => {
  const modelNew: SpaceModel = {
    ...model,
    origin: {
      x: msg[1].x,
      y: model.origin.y,
    },
  }

  if (inCollision(modelNew)) {
    return ['MouseMove_Done', Err('collision')]
  }

  return ['MouseMove_Done', Ok(modelNew)]
}

export type InputTranslate = ['InputTranslate', { direction: Direction.Direction }]
export type InputTranslate_Done = ['InputTranslate_Done', Result<InputTranslateProblem, SpaceModel>]
export type InputTranslateProblem = 'collision'

export const inputTranslate = ({ direction }: InputTranslate[1], model: SpaceModel): InputTranslate_Done[1] => {
  const originNext = Position.add(Direction.toPosition(direction), model.origin)

  const modelNext: SpaceModel = {
    ...model,
    origin: originNext,
  }

  if (inCollision(modelNext)) {
    return Result.Err('collision')
  }

  return Result.Ok(modelNext)
}

//
//
//
//
//
//
//

export type InputRotate = ['InputRotate']
export type InputRotate_Done = ['InputRotate_Done', Result<InputRotateProblem, SpaceModel>]
export type InputRotateProblem = 'collision'

export const inputRotate = (model: SpaceModel): InputRotate_Done[1] => {
  const modelNew: SpaceModel = {
    ...model,
    rotations: toNextRotation(model.rotations),
  }

  if (inCollision(modelNew)) {
    return Result.Err('collision')
  }

  return Result.Ok(modelNew)
}

const toNextRotation = (rotation: 0 | 1 | 2 | 3): 0 | 1 | 2 | 3 => {
  switch (rotation) {
    case 0:
      return 1
    case 1:
      return 2
    case 2:
      return 3
    case 3:
      return 0
  }
}

//
//
//
//
//
//
//

export type InputDrop = ['InputDrop']
export type InputDrop_Done = ['InputDrop_Done', Result<InputDropProblem, SpaceModel>]
export type InputDropProblem = ''

export const inputDrop = (model: SpaceModel): InputDrop_Done[1] => {
  const modelNext = tick(toDrop(model))

  return Result.Ok(modelNext)
}

//
//
//
//
//
//
//

export type Tick = ['tick']
export type Tick_Done = ['Tick_Done', SpaceModel]

export const tick = (model: SpaceModel): SpaceModel => {
  const originNext = Position.add(Direction.toPosition('Down'), model.origin)

  const modelNext: SpaceModel = {
    ...model,
    origin: originNext,
  }

  if (inCollision(modelNext)) {
    const tetromino = toPiece(model)

    const boardNew = tetromino.reduce(
      (board, position) => Board.setCell(position, model.tetrominoName, board),
      model.board,
    )

    const tetrominoNameNew = randomElement(Piece.allNames) ?? 'O'

    return {
      ...model,
      origin: initialOrigin,
      tetrominoName: tetrominoNameNew,
      rotations: 0,
      board: boardNew,
    }
  }

  return modelNext
}

//
//
//
// Utils
//
//
//

const randomElement = <T>(xs: T[]) => {
  return xs[Math.floor(xs.length * Math.random())]
}
