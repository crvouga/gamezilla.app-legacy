import type { SpaceCtx } from '~/app/spaces/@/space-ctx'
import { UserId } from '~/app/@/data'
import { Posix } from '~/@/core'
import { p } from '~/@/core/parser'
import {
  type ColumnIndex,
  Columns,
  EMPTY_COLUMNS,
  MoveProblem,
  PlayerType,
  dropDisc,
  toStatus,
  toTurn
} from '../@/connect-four/connect-four'

//
//
//
// Model
//
//
//

export type ModelClient = {
  openedModal: 'confirm-resign' | null
  ghostIndex: ColumnIndex | null
}

export const ModelServer = p.l(null)
export type ModelServer = p.Infer<typeof ModelServer>

//
//
//
// Msg
//
//
//

export type MsgServer = { t: null }

export type MsgClient =
  | MsgCore
  | { t: 'hovered-over-columns'; columnIndex: ColumnIndex }
  | { t: 'clicked-resign'; userId: UserId }
  | { t: 'close-modal' }

export type MsgToServer = { t: null }

export type MsgToClient = { t: null }

//
//
//
//
//

const MoveTimeLimit = p.enumeration([5, 7, 9])

const RematchResponse = p.enumeration(['Accept', 'Decline'])

export const MsgCore = p.or(
  p.obj({
    t: p.l('user-stopped-playing'),
    userId: UserId
  }),
  p.obj({
    t: p.l('user-started-playing'),
    userId: UserId,
    playerType: PlayerType
  }),
  p.obj({
    t: p.l('user-inputted-move-time-limit'),
    userId: UserId,
    moveTimeLimit: MoveTimeLimit
  }),
  p.obj({
    t: p.l('user-dropped-disc'),
    columnIndex: p.num,
    userId: UserId
  }),
  p.obj({
    t: p.l('user-started-game'),
    userId: UserId
  }),
  p.obj({
    t: p.l('user-stopped-game'),
    userId: UserId
  }),
  p.obj({
    t: p.l('user-requested-rematch'),
    userId: UserId
  }),
  p.obj({
    t: p.l('user-responded-to-rematch-request'),
    userId: UserId,
    response: RematchResponse
  }),
  p.obj({
    t: p.l('user-cancelled-rematch'),
    userId: UserId
  }),
  p.obj({
    t: p.l('user-resigned'),
    userId: UserId
  }),
  p.obj({
    t: p.l('time-passed'),
    currentTime: Posix
  }),
  p.obj({
    t: p.l('user-left'),
    userId: UserId
  })
)
export type MsgCore = p.Infer<typeof MsgCore>

const GameOver = p.or(
  p.obj({
    type: p.l('Draw')
  }),
  p.obj({
    type: p.l('Winner'),
    winner: PlayerType
  }),
  p.obj({
    type: p.l('resignation'),
    resigner: PlayerType
  })
)
export type GameOver = p.Infer<typeof GameOver>

const EventError = p.or(
  p.obj({
    t: p.l('not-playing')
  }),
  p.obj({
    t: p.l('move'),
    c: MoveProblem
  })
)

type EventError = p.Infer<typeof EventError>

const Rematch = p.or(
  p.obj({
    type: p.l('NotAsking')
  }),
  p.obj({
    type: p.l('Asking'),
    asker: PlayerType
  })
)
export type Rematch = p.Infer<typeof Rematch>

const Errors = p.obj({
  errors: p.dict(
    p.str,
    p.and(
      MsgCore,
      p.obj({
        error: EventError
      })
    )
  )
})

type Errors = p.Infer<typeof Errors>

const addError = (modelCore: ModelCore, msgCore: MsgCore, error: EventError): ModelCore => {
  return {
    ...modelCore,
    errors: {
      ...modelCore.errors,
      [JSON.stringify(msgCore)]: {
        ...msgCore,
        error
      }
    }
  }
}

export const StateSetup = p.and(
  Errors,
  p.obj({
    type: p.l('setup'),
    moveTimeLimit: MoveTimeLimit,
    players: p.partialDict(PlayerType, p.maybe(UserId))
  })
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
    players: p.dict(PlayerType, UserId)
  })
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
    players: p.dict(PlayerType, UserId)
  })
)
export type StateGameOver = p.Infer<typeof StateGameOver>

export const ModelCore = p.or(StateSetup, StateGame, StateGameOver)
export type ModelCore = p.Infer<typeof ModelCore>

export const initCore = (ctx: SpaceCtx): ModelCore => {
  return {
    type: 'setup',
    moveTimeLimit: 5,
    players: {
      'player-one': ctx.space.hostId,
      'player-two': null
    },
    errors: {}
  }
}

export const toGameOver = (modelCore: ModelCore): GameOver | { type: 'none' } => {
  if (modelCore.type === 'setup') {
    return { type: 'none' }
  }

  const status = toStatus(modelCore.columns)

  if (status.type === 'Tie') {
    return { type: 'Draw' }
  }

  if (status.type === 'Winner') {
    return {
      type: 'Winner',
      winner: status.winner
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
  '9': 9
}

export const updateCore = (modelCore: ModelCore, msgCore: MsgCore): ModelCore => {
  switch (modelCore.type) {
    case 'setup': {
      switch (msgCore.t) {
        case 'user-started-playing': {
          if (modelCore.players[msgCore.playerType] !== null) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }

          return {
            ...modelCore,
            players: {
              ...modelCore.players,
              [msgCore.playerType]: msgCore.userId
            }
          }
        }

        case 'user-stopped-playing': {
          const playerType = toPlayerType(msgCore.userId, modelCore)

          if (!playerType) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }

          return {
            ...modelCore,
            players: {
              ...modelCore.players,
              [playerType]: null
            }
          }
        }

        case 'user-inputted-move-time-limit': {
          return {
            ...modelCore,
            moveTimeLimit: msgCore.moveTimeLimit
          }
        }

        case 'user-started-game': {
          const playerOne = modelCore.players['player-one']
          const playerTwo = modelCore.players['player-two']

          if (!playerOne || !playerTwo) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }

          return {
            errors: modelCore.errors,
            type: 'game',
            columns: EMPTY_COLUMNS,
            moveTimeLimit: modelCore.moveTimeLimit,
            lastMoveAt: Posix.now(),
            gameId: 0,
            players: {
              'player-one': playerOne,
              'player-two': playerTwo
            }
          }
        }

        default: {
          return modelCore
        }
      }
    }

    case 'game': {
      switch (msgCore.t) {
        case 'user-dropped-disc': {
          const turn = toTurn(modelCore.columns)

          const dropped = dropDisc(modelCore.columns, msgCore.columnIndex, turn)

          if (dropped.t === 'err') {
            return addError(modelCore, msgCore, {
              t: 'move',
              c: dropped.error
            })
          }

          return {
            ...modelCore,
            columns: dropped.value
            // lastMoveAt: msgCore.happenedAt,
          }
        }

        case 'user-resigned': {
          const resignedPlayer = toPlayerType(msgCore.userId, modelCore)

          if (!resignedPlayer) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }

          return {
            ...modelCore,
            type: 'game-over',
            gameOver: {
              type: 'resignation',
              resigner: resignedPlayer
            },
            rematch: {
              type: 'NotAsking'
            }
          }
        }

        case 'time-passed': {
          return modelCore
        }
      }
      return modelCore
    }

    case 'game-over': {
      return modelCore
    }
  }
}

export const toPlayerType = (userId: UserId, modelCore: ModelCore): PlayerType | null => {
  if (modelCore.players['player-one'] === userId) {
    return 'player-one'
  }

  if (modelCore.players['player-two'] === userId) {
    return 'player-two'
  }

  return null
}
