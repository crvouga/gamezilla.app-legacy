import type * as Piece from './piece'
import type * as Position from './position'

//
//
//
// Model
//
//
//

export type Board = {
  rowCount: number
  columnCount: number
  matrix: Cell[][]
}

export type Cell = 'Empty' | Piece.Name

export const init = ({ columnCount, rowCount }: { columnCount: number; rowCount: number }): Board => {
  const emptyMatrix: Cell[][] = repeat(columnCount, repeat(rowCount, 'Empty'))
  return {
    rowCount,
    columnCount,
    matrix: emptyMatrix
  }
}

export const flatMap = <T>(board: Board, f: (item: { cell: Cell; x: number; y: number }) => T): T[] => {
  return board.matrix.flatMap((column, x) =>
    column.map((cell, y) =>
      f({
        cell,
        x,
        y
      })
    )
  )
}

export const toCell = (position: Position.Position, board: Board): Cell => {
  return board.matrix?.[position.x]?.[position.y] ?? 'Empty'
}

export const setCell = (position: Position.Position, cellNext: Cell, board: Board): Board => {
  const matrixNew = board.matrix.map((column, x) =>
    column.map((cell, y) => (position.x === x && position.y === y ? cellNext : cell))
  )

  return {
    ...board,
    matrix: matrixNew
  }
}

export const toRowCount = (board: Board) => {
  return board.rowCount
}

export const toColumnCount = (board: Board) => {
  return board.columnCount
}

export const transpose = (board: Board): Board => {
  const { columnCount, rowCount, matrix } = board

  const matrixNew = matrix.reduce<Cell[][]>(
    (prev, next) => next.map((_item, i) => (prev[i] || []).concat(next[i] ?? [])),
    []
  )

  return {
    rowCount: columnCount,
    columnCount: rowCount,
    matrix: matrixNew
  }
}

export const toFilledRows = (board: Board): number[] => {
  const filledRows: number[] = []

  for (let x = 0; x < board.columnCount; x++) {
    for (let y = 0; y < board.rowCount; y++) {
      //
    }
  }

  return filledRows
}

//
//
//
// Utils
//
//
//

const repeat = <T>(count: number, x: T): T[] => {
  if (count <= 0) {
    return []
  }

  return [x, ...repeat(count - 1, x)]
}
