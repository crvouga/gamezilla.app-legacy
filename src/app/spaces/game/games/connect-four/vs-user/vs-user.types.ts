import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { UserId } from '~/app/@/data/user-id'
import { Posix } from '~/@/time/posix'
import { p } from '~/@/schema'
import {
  type ColumnIndex,
  Columns,
  EMPTY_COLUMNS,
  MoveProblem,
  PlayerType,
  dropDisc,
  toStatus,
  toTurn,
} from '../@/connect-four/connect-four'

//
//
//
// Model
//
//
//

export type ModelFrontend = {
  openedModal: 'confirm-resign' | null
  ghostIndex: ColumnIndex | null
}

export const ModelBackend = p.l(null)
export type ModelBackend = p.Infer<typeof ModelBackend>

//
//
//
// Msg
//
//
//

export type MsgBackend = { t: null }

export type MsgFrontend =
  | MsgSpace
  | { t: 'hovered-over-columns'; columnIndex: ColumnIndex }
  | { t: 'clicked-resign'; userId: UserId }
  | { t: 'close-modal' }

export type MsgToBackend = { t: null }

export type MsgToFrontend = { t: null }

//
//
//
//
//

const MoveTimeLimit = p.enumeration([5, 7, 9])

const RematchResponse = p.enumeration(['Accept', 'Decline'])

export const MsgSpace = p.or(
  p.obj({
    t: p.l('user-stopped-playing'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-started-playing'),
    userId: UserId,
    playerType: PlayerType,
  }),
  p.obj({
    t: p.l('user-inputted-move-time-limit'),
    userId: UserId,
    moveTimeLimit: MoveTimeLimit,
  }),
  p.obj({
    t: p.l('user-dropped-disc'),
    columnIndex: p.num,
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-started-game'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-stopped-game'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-requested-rematch'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-responded-to-rematch-request'),
    userId: UserId,
    response: RematchResponse,
  }),
  p.obj({
    t: p.l('user-cancelled-rematch'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-resigned'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('time-passed'),
    currentTime: Posix,
  }),
  p.obj({
    t: p.l('user-left'),
    userId: UserId,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>

const GameOver = p.or(
  p.obj({
    type: p.l('Draw'),
  }),
  p.obj({
    type: p.l('Winner'),
    winner: PlayerType,
  }),
  p.obj({
    type: p.l('resignation'),
    resigner: PlayerType,
  }),
)
export type GameOver = p.Infer<typeof GameOver>

const EventError = p.or(
  p.obj({
    t: p.l('not-playing'),
  }),
  p.obj({
    t: p.l('move'),
    c: MoveProblem,
  }),
)

type EventError = p.Infer<typeof EventError>

const Rematch = p.or(
  p.obj({
    type: p.l('NotAsking'),
  }),
  p.obj({
    type: p.l('Asking'),
    asker: PlayerType,
  }),
)
export type Rematch = p.Infer<typeof Rematch>

const Errors = p.obj({
  errors: p.dict(
    p.str,
    p.and(
      MsgSpace,
      p.obj({
        error: EventError,
      }),
    ),
  ),
})

type Errors = p.Infer<typeof Errors>

const addError = (modelSpace: ModelSpace, msgSpace: MsgSpace, error: EventError): ModelSpace => {
  return {
    ...modelSpace,
    errors: {
      ...modelSpace.errors,
      [JSON.stringify(msgSpace)]: {
        ...msgSpace,
        error,
      },
    },
  }
}

export const StateSetup = p.and(
  Errors,
  p.obj({
    type: p.l('setup'),
    moveTimeLimit: MoveTimeLimit,
    players: p.partialDict(PlayerType, p.maybe(UserId)),
  }),
)
export type StateSetup = p.Infer<typeof StateSetup>

export const StateGame = p.and(
  Errors,
  p.obj({
    type: p.l('game'),
    moveTimeLimit: MoveTimeLimit,
    columns: Columns,
    gameId: p.num,
    lastMoveAt: Posix,
    players: p.dict(PlayerType, UserId),
  }),
)
export type StateGame = p.Infer<typeof StateGame>

export const StateGameOver = p.and(
  Errors,
  p.obj({
    type: p.l('game-over'),
    moveTimeLimit: MoveTimeLimit,
    columns: Columns,
    gameId: p.num,
    gameOver: GameOver,
    rematch: Rematch,
    players: p.dict(PlayerType, UserId),
  }),
)
export type StateGameOver = p.Infer<typeof StateGameOver>

export const ModelSpace = p.or(StateSetup, StateGame, StateGameOver)
export type ModelSpace = p.Infer<typeof ModelSpace>

export const initSpace = (ctx: SpaceCtx): ModelSpace => {
  return {
    type: 'setup',
    moveTimeLimit: 5,
    players: {
      'player-one': ctx.space.hostId,
      'player-two': null,
    },
    errors: {},
  }
}

export const toGameOver = (modelSpace: ModelSpace): GameOver | { type: 'none' } => {
  if (modelSpace.type === 'setup') {
    return { type: 'none' }
  }

  const status = toStatus(modelSpace.columns)

  if (status.type === 'Tie') {
    return { type: 'Draw' }
  }

  if (status.type === 'Winner') {
    return {
      type: 'Winner',
      winner: status.winner,
    }
  }

  return { type: 'none' }
}

export type MoveTimeLimit = 5 | 7 | 9

export const allMoveTimeLimit: {
  [moveTimeLimit in MoveTimeLimit]: MoveTimeLimit
} = {
  '5': 5,
  '7': 7,
  '9': 9,
}

export const updateSpace = (modelSpace: ModelSpace, msgSpace: MsgSpace): ModelSpace => {
  switch (modelSpace.type) {
    case 'setup': {
      switch (msgSpace.t) {
        case 'user-started-playing': {
          if (modelSpace.players[msgSpace.playerType] !== null) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }

          return {
            ...modelSpace,
            players: {
              ...modelSpace.players,
              [msgSpace.playerType]: msgSpace.userId,
            },
          }
        }

        case 'user-stopped-playing': {
          const playerType = toPlayerType(msgSpace.userId, modelSpace)

          if (!playerType) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }

          return {
            ...modelSpace,
            players: {
              ...modelSpace.players,
              [playerType]: null,
            },
          }
        }

        case 'user-inputted-move-time-limit': {
          return {
            ...modelSpace,
            moveTimeLimit: msgSpace.moveTimeLimit,
          }
        }

        case 'user-started-game': {
          const playerOne = modelSpace.players['player-one']
          const playerTwo = modelSpace.players['player-two']

          if (!playerOne || !playerTwo) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }

          return {
            errors: modelSpace.errors,
            type: 'game',
            columns: EMPTY_COLUMNS,
            moveTimeLimit: modelSpace.moveTimeLimit,
            lastMoveAt: Posix.now(),
            gameId: 0,
            players: {
              'player-one': playerOne,
              'player-two': playerTwo,
            },
          }
        }

        default: {
          return modelSpace
        }
      }
    }

    case 'game': {
      switch (msgSpace.t) {
        case 'user-dropped-disc': {
          const turn = toTurn(modelSpace.columns)

          const dropped = dropDisc(modelSpace.columns, msgSpace.columnIndex, turn)

          if (dropped.t === 'err') {
            return addError(modelSpace, msgSpace, {
              t: 'move',
              c: dropped.error,
            })
          }

          return {
            ...modelSpace,
            columns: dropped.value,
            // lastMoveAt: msgSpace.happenedAt,
          }
        }

        case 'user-resigned': {
          const resignedPlayer = toPlayerType(msgSpace.userId, modelSpace)

          if (!resignedPlayer) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }

          return {
            ...modelSpace,
            type: 'game-over',
            gameOver: {
              type: 'resignation',
              resigner: resignedPlayer,
            },
            rematch: {
              type: 'NotAsking',
            },
          }
        }

        case 'time-passed': {
          return modelSpace
        }
      }
      return modelSpace
    }

    case 'game-over': {
      return modelSpace
    }
  }
}

export const toPlayerType = (userId: UserId, modelSpace: ModelSpace): PlayerType | null => {
  if (modelSpace.players['player-one'] === userId) {
    return 'player-one'
  }

  if (modelSpace.players['player-two'] === userId) {
    return 'player-two'
  }

  return null
}
