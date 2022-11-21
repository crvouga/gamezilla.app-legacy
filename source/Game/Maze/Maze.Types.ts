import { Keyboard, memoize, Random, Result, Set as CoreSet } from "../../Core"
import { Err, Ok } from "../../Core/Result"
import { UserId } from "../../Data"
import { Bounds, Direction, Position } from "./Position"

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
    players: CoreSet<UserId>,
    colors: ColorMap
    seed: string
    inclusiveUpperBound: Position
  }
  | {
    type: "Game",
    players: { [userId: UserId]: Player }
    colors: ColorMap
    seed: string,
    inclusiveUpperBound: Position
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
  hasNorth: boolean
  hasWest: boolean
}


// 
// 
// 
// Msg
// 
// 
// 

export type FrontendMsg = Req | ['KeyDown', Keyboard.Key]

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
  | ['InputDirection', { userId: UserId, direction: Direction }]

export type Res = [...Req, Result<Problem, SharedModel>]

type Problem =
  | "must_be_setup"
  | "already_playing"
  | "must_have_at_least_one_player"
  | "must_be_playing"
  | "must_be_game"
  | "out_of_bounds"
  | "hit_wall"

export const handle = (msg: Req, model: SharedModel): Result<Problem, SharedModel> => {
  switch (msg[0]) {
    case 'StartPlaying': {
      if (model.type !== 'Setup') {
        return Err("must_be_setup")
      }

      if (CoreSet.isMember(msg[1].userId, model.players)) {
        return Err("already_playing")
      }

      const modelNew: SharedModel = {
        ...model,
        players: CoreSet.add(msg[1].userId, model.players)
      }
      return Ok(modelNew)
    }

    case 'StopPlaying': {
      if (model.type !== 'Setup') {
        return Err("must_be_setup")
      }

      const modelNew: SharedModel = {
        ...model,
        players: CoreSet.remove(msg[1].userId, model.players)
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
        CoreSet.toArray(model.players)
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
        seed: model.seed,
        inclusiveUpperBound: model.inclusiveUpperBound,
        players: playersNew,
      }

      return Ok(modelNew)
    }

    case 'InputDirection': {
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

      const maze = toMaze(model)

      if (!canMoveTo({ maze: maze, from: player.position, to: positionNew })) {
        return Err("hit_wall")
      }

      const inbounds =
        Position.inclusiveContains(
          {
            lower: { x: 0, y: 0 },
            upper: model.inclusiveUpperBound
          },
          positionNew
        )


      if (!inbounds) {
        return Err("out_of_bounds")
      }

      const playerNew: Player = {
        ...player,
        position: positionNew,
        direction: msg[1].direction
      }

      const modelNew: SharedModel = {
        type: "Game",
        colors: model.colors,
        seed: model.seed,
        inclusiveUpperBound: model.inclusiveUpperBound,
        players: {
          ...model.players,
          [playerNew.userId]: playerNew
        },
      }

      return Ok(modelNew)
    }
  }
}


const canMoveTo = ({ maze, from, to }: { from: Position, to: Position, maze: Maze }): boolean => {
  const fromCell = maze?.[from.x]?.[from.y] ?? null
  const toCell = maze?.[to.x]?.[to.y] ?? null
  const direction = Position.toDirection({ from, to })

  return (
    (direction === 'East' && !toCell?.hasWest) ||
    (direction === 'North' && !fromCell?.hasNorth) ||
    (direction === 'South' && !toCell?.hasNorth) ||
    (direction === 'West' && !fromCell?.hasWest)
  )
}

//
//
//
// Init
//
//
//

type MazeParams = {
  seed: string,
  inclusiveUpperBound: Position
}

export const encodeParams = ({ seed, inclusiveUpperBound }: MazeParams) => [seed, inclusiveUpperBound.x, inclusiveUpperBound.y].join("-")

export const toMaze = memoize<MazeParams, Maze>(encodeParams, ({ seed, inclusiveUpperBound }) => {
  const gen = Random.generator(seed)

  const maze: Cell[][] = []

  for (let x = 0; x <= inclusiveUpperBound.x; x++) {
    const vertical: Cell[] = []
    for (let y = 0; y <= inclusiveUpperBound.y; y++) {
      vertical.push({ hasWest: true, hasNorth: true })
    }
    maze.push(vertical)
  }

  const boundsInclusive: Bounds = {
    lower: { x: 0, y: 0 },
    upper: inclusiveUpperBound
  }

  const initial: Position = { x: 0, y: 0 }
  const stack: Position[] = [initial]
  const visited = new Set<string>()
  visited.add(Position.toKey(initial))

  while (true) {
    const current = stack.pop()

    if (!current) {
      break
    }

    // 
    //
    // 

    let unvisitedNeighbor: { position: Position, direction: Direction } | null = null

    for (const direction of Random.shuffle(gen, Direction.all)) {
      const neighbor = Position.add(Direction.toVector(direction), current)

      if (!Position.inclusiveContains(boundsInclusive, neighbor)) {
        continue
      }

      if (visited.has(Position.toKey(neighbor))) {
        continue
      }

      unvisitedNeighbor = { position: neighbor, direction }
      break
    }


    if (!unvisitedNeighbor) {
      continue
    }

    stack.push(current)
    stack.push(unvisitedNeighbor.position)
    visited.add(Position.toKey(unvisitedNeighbor.position))

    // 
    // break down walls
    // 
    switch (unvisitedNeighbor.direction) {
      case 'East':
        maze[unvisitedNeighbor.position.x]![unvisitedNeighbor.position.y]!.hasWest = false
        break

      case 'North':
        maze[current.x]![current.y]!.hasNorth = false
        break

      case 'South':
        maze[unvisitedNeighbor.position.x]![unvisitedNeighbor.position.y]!.hasNorth = false
        break

      case 'West':
        maze[current.x]![current.y]!.hasWest = false
        break
    }
  }

  return maze
})


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
      column.push({ hasWest: true, hasNorth: true })
    }

    maze.push(column)
  }

  return maze
}

export const initShared: SharedModel = {
  type: "Setup",
  players: {},
  colors: {},
  seed: "some arbitrary seed",
  inclusiveUpperBound: { x: 15, y: 15 }
}