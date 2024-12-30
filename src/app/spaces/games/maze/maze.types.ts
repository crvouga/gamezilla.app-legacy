import { NonEmpty } from '~/@/array/non-empty'
import { Keyboard } from '~/@/browser'
import { Err, Ok, type Result } from '~/@/core'
import { dissoc } from '~/@/object/dissoc'
import type { UserId } from '~/app/@/data'
import { Maze } from './@/maze'
import { Direction, Position } from './@/position'

//
//
//
// Model
//
//
//

export type CoreModel = SetupModel

export type SetupModel =
  | {
      type: 'setup'
      players: {
        [userId: UserId]: {
          userId: UserId
          color: Color
        }
      }
      seed: string
      lower: Position
      upper: Position
    }
  | {
      type: 'game'
      players: {
        [userId: UserId]: Player
      }
      seed: string
      lower: Position
      upper: Position
    }

type Player = {
  userId: UserId
  position: Position
  direction: Direction | 'none'
  color: Color
}

export type Color = 'Red' | 'Blue' | 'Green' | 'Purple' | 'Cyan' | 'Pink'

const colorSeq: NonEmpty<Color> = ['Red', 'Blue', 'Green', 'Purple']

export type ModelClient = CoreModel

export type ModelServer = CoreModel

//
//
//
// Msg
//
//
//

export type MsgClient = Req | ['key-down', Keyboard.Key] | ['key-up', Keyboard.Key]

export type MsgServer = ['tick']

export type MsgToServer = Req

export type MsgToClient = Res | ['tick', CoreModel]

//
//
//
//

export type Req =
  | ['start-playing', { userId: UserId }]
  | ['stop-playing', { userId: UserId }]
  | ['start-game', { userId: UserId }]
  | ['stop-game', { userId: UserId }]
  | [
      'input-direction',
      {
        userId: UserId
        direction: Direction | 'none'
      }
    ]
  | ['input-seed', { userId: UserId; seed: string }]

export type Res = [...Req, Result<Problem, CoreModel>]

type Problem =
  | 'must_be_setup'
  | 'already_playing'
  | 'must_have_at_least_one_player'
  | 'must_be_playing'
  | 'must_be_game'
  | 'out_of_bounds'
  | 'hit_wall'
  | 'no_next_color'

const toNextColor = (model: CoreModel): Color | null => {
  for (const color of colorSeq) {
    if (Object.values(model.players).every((p) => p.color !== color)) {
      return color
    }
  }
  return null
}

export const handle = (msg: Req, model: CoreModel): Result<Problem, CoreModel> => {
  switch (msg[0]) {
    case 'input-seed': {
      if (model.type !== 'setup') {
        return Err('must_be_setup')
      }

      const player = model.players[msg[1].userId]

      if (!player) {
        return Err('must_be_playing')
      }

      const modelNew: CoreModel = {
        ...model,
        seed: msg[1].seed
      }

      return Ok(modelNew)
    }

    case 'stop-game': {
      if (model.type !== 'game') {
        return Err('must_be_game')
      }

      const player = model.players[msg[1].userId]

      if (!player) {
        return Err('must_be_playing')
      }

      const modelNew: CoreModel = {
        type: 'setup',
        lower: model.lower,
        players: mapValues(
          (val) => ({
            userId: val.userId,
            color: val.color
          }),
          model.players
        ),
        seed: model.seed,
        upper: model.upper
      }

      return Ok(modelNew)
    }

    case 'start-playing': {
      if (model.type !== 'setup') {
        return Err('must_be_setup')
      }

      const player = model.players[msg[1].userId]

      if (player) {
        return Err('already_playing')
      }

      const nextColor = toNextColor(model)

      if (!nextColor) {
        return Err('no_next_color')
      }

      const modelNew: CoreModel = {
        ...model,
        players: {
          ...model.players,
          [msg[1].userId]: {
            color: nextColor,
            userId: msg[1].userId
          }
        }
      }
      return Ok(modelNew)
    }

    case 'stop-playing': {
      if (model.type !== 'setup') {
        return Err('must_be_setup')
      }

      const modelNew: CoreModel = {
        ...model,
        players: dissoc(model.players, msg[1].userId)
      }

      return Ok(modelNew)
    }

    case 'start-game': {
      if (model.type !== 'setup') {
        return Err('must_be_setup')
      }

      if (Object.values(model.players).length === 0) {
        return Err('must_have_at_least_one_player')
      }

      const playersNew = Object.values(model.players).reduce<{
        [userId: UserId]: Player
      }>((byId, player) => {
        const playerNew: Player = {
          userId: player.userId,
          color: player.color,
          position: {
            x: 0,
            y: 0
          },
          direction: 'none'
        }
        return {
          ...byId,
          [player.userId]: playerNew
        }
      }, {})

      const modelNew: CoreModel = {
        type: 'game',
        seed: model.seed,
        lower: model.lower,
        upper: model.upper,
        players: playersNew
      }

      return Ok(modelNew)
    }

    case 'input-direction': {
      if (model.type !== 'game') {
        return Err('must_be_game')
      }

      const player = model.players[msg[1].userId]

      if (!player) {
        return Err('must_be_playing')
      }

      const modelNew: CoreModel = {
        type: 'game',
        seed: model.seed,
        upper: model.upper,
        lower: model.lower,
        players: {
          ...model.players,
          [player.userId]: {
            ...player,
            direction: msg[1].direction
          }
        }
      }

      return Ok(modelNew)
    }
  }
}

export const tick = (model: CoreModel): CoreModel => {
  if (model.type !== 'game') {
    return model
  }

  const maze = Maze.makeMemoized(model)

  const modelNew: CoreModel = {
    ...model,
    players: mapValues((player) => mapPlayer(maze, player), model.players)
  }

  return modelNew
}

const mapPlayer = (maze: Maze, player: Player): Player => {
  if (player.direction === 'none') {
    return player
  }

  const positionNew = Position.add(Direction.toVector(player.direction), player.position)

  const playerNew: Player = {
    ...player,
    position: positionNew
  }

  if (!Maze.hasEdge([player.position, playerNew.position], maze) || !Maze.hasVertex(playerNew.position, maze)) {
    return {
      ...player,
      direction: 'none'
    }
  }

  return playerNew
}

const mapValues = <A, B>(f: (a: A) => B, record: Record<string, A>) => {
  const ret: Record<string, B> = {}
  for (const key in record) {
    const value = record[key]
    if (value) {
      ret[key] = f(value)
    }
  }
  return ret
}

//
//
//
// Init
//
//
//

export const initShared = ({ userId }: { userId?: UserId }): CoreModel => {
  return {
    type: 'setup',
    players: userId
      ? {
          [userId]: {
            color: colorSeq[0],
            userId
          }
        }
      : {},
    seed: 'some arbitrary seed',
    lower: { x: -10, y: -10 },
    upper: { x: 10, y: 10 }
  }
}
