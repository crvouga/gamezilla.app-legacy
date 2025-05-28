import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { UserId } from '~/app/@/data/user-id'
import { Posix } from '~/@/time/posix'
import { s } from '~/@/schema'
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

export const ModelBackend = s.l(null)
export type ModelBackend = s.Infer<typeof ModelBackend>

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

const MoveTimeLimit = s.enumeration([5, 7, 9])

const RematchResponse = s.enumeration(['Accept', 'Decline'])

export const MsgSpace = s.or(
  s.obj({
    t: s.l('user-stopped-playing'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-started-playing'),
    userId: UserId,
    playerType: PlayerType,
  }),
  s.obj({
    t: s.l('user-inputted-move-time-limit'),
    userId: UserId,
    moveTimeLimit: MoveTimeLimit,
  }),
  s.obj({
    t: s.l('user-dropped-disc'),
    columnIndex: s.num,
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-started-game'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-stopped-game'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-requested-rematch'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-responded-to-rematch-request'),
    userId: UserId,
    response: RematchResponse,
  }),
  s.obj({
    t: s.l('user-cancelled-rematch'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-resigned'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('time-passed'),
    currentTime: Posix,
  }),
  s.obj({
    t: s.l('user-left'),
    userId: UserId,
  }),
)
export type MsgSpace = s.Infer<typeof MsgSpace>

const GameOver = s.or(
  s.obj({
    type: s.l('Draw'),
  }),
  s.obj({
    type: s.l('Winner'),
    winner: PlayerType,
  }),
  s.obj({
    type: s.l('resignation'),
    resigner: PlayerType,
  }),
)
export type GameOver = s.Infer<typeof GameOver>

const EventError = s.or(
  s.obj({
    t: s.l('not-playing'),
  }),
  s.obj({
    t: s.l('move'),
    c: MoveProblem,
  }),
)

type EventError = s.Infer<typeof EventError>

const Rematch = s.or(
  s.obj({
    type: s.l('NotAsking'),
  }),
  s.obj({
    type: s.l('Asking'),
    asker: PlayerType,
  }),
)
export type Rematch = s.Infer<typeof Rematch>

const Errors = s.obj({
  errors: s.dict(
    s.str,
    s.and(
      MsgSpace,
      s.obj({
        error: EventError,
      }),
    ),
  ),
})

type Errors = s.Infer<typeof Errors>

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

export const StateSetup = s.and(
  Errors,
  s.obj({
    type: s.l('setup'),
    moveTimeLimit: MoveTimeLimit,
    players: s.partialDict(PlayerType, s.maybe(UserId)),
  }),
)
export type StateSetup = s.Infer<typeof StateSetup>

export const StateGame = s.and(
  Errors,
  s.obj({
    type: s.l('game'),
    moveTimeLimit: MoveTimeLimit,
    columns: Columns,
    gameId: s.num,
    lastMoveAt: Posix,
    players: s.dict(PlayerType, UserId),
  }),
)
export type StateGame = s.Infer<typeof StateGame>

export const StateGameOver = s.and(
  Errors,
  s.obj({
    type: s.l('game-over'),
    moveTimeLimit: MoveTimeLimit,
    columns: Columns,
    gameId: s.num,
    gameOver: GameOver,
    rematch: Rematch,
    players: s.dict(PlayerType, UserId),
  }),
)
export type StateGameOver = s.Infer<typeof StateGameOver>

export const ModelSpace = s.or(StateSetup, StateGame, StateGameOver)
export type ModelSpace = s.Infer<typeof ModelSpace>

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
