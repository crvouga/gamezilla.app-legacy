//   https://en.wikipedia.org/wiki/Numberlink

type DisjointSets<T> = [T, T][]

export const union = <T,>(
  _a: T,
  _b: T,
  set: DisjointSets<T>,
): DisjointSets<T> => {
  return set
}

// export const find = <T>(element: T, set: DisjointSets<T>): boolean => {
//     // return set.map(([a, b]) => a === b)
// }

export type Model = {
  board: Board
}

type Board = {
  size: number
  sets: DisjointSets<Position>
}

export const emptyBoard = (size: number): Board => {
  return {
    size,
    sets: [],
  }
}

type Position = {
  x: number
  y: number
}

export const toAllPositions = (board: Board): Position[] => {
  const positions: Position[] = []

  for (let x = 0; x < board.size; x++) {
    for (let y = 0; y < board.size; y++) {
      positions.push({ x, y })
    }
  }

  return positions
}

export const generateBoard = () => {}

//
//
//
// View
//
//
//

export const ViewBoard = ({ board }: { board: Board }) => {
  return (
    <svg
      width="100%"
      viewBox={toViewBox(board)}
    >
      {toAllPositions(board).map((position) => (
        <rect
          key={`${position.x}, ${position.y}`}
          x={position.x}
          y={position.y}
          width={1}
          height={1}
          stroke={"#fff"}
          strokeWidth={0.01}
        />
      ))}
    </svg>
  )
}

const toViewBox = (board: Board): string => {
  return [0, 0, board.size, board.size].join(", ")
}
