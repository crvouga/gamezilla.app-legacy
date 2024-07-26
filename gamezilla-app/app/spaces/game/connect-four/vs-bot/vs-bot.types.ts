import { Posix, TimeSpan } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import { EventId, type WithEventId } from 'gamezilla-app/app/spaces/@/event'
import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space'
import type { VsBotGame, VsBotSetup } from 'gamezilla-app/app/spaces/game/@/vs-bot'
import * as ConnectFour from '../@/connect-four'
import { BotLevel } from './bot-level'

//
//
// Model
//
//

export const ModelServer = p.obj({
  botStartedFindingMoveAt: p.maybe(Posix)
})
export type ModelServer = p.Infer<typeof ModelServer>

export const isBotMoving = (now: Posix, model: ModelServer) => {
  if (!model.botStartedFindingMoveAt) {
    return false
  }
  return TimeSpan.lte(Posix.diff(now, model.botStartedFindingMoveAt), TimeSpan.seconds(5))
}

export type ModelClient = {
  vsBotSetup: VsBotSetup.Model
  vsBotGame: VsBotGame.Model
}

//
//
// Msg
//
//

export type MsgClient = MsgCore | { t: 'vs-bot-setup'; c: VsBotSetup.Msg } | { t: 'vs-bot-game'; c: VsBotGame.Msg }

export type MsgServer =
  | {
      t: 'bot-found-best-move'
      found: ConnectFour.BestMoveResult
      startedAt: Posix
    }
  | {
      t: 'time-passed'
    }

export type MsgToClient = { t: null }

export type MsgToServer = { t: null }

export const MsgCore = p.or(
  p.obj({
    t: p.l('user-dropped-disc'),
    columnIndex: ConnectFour.ColumnIndex,
    userId: UserId
  }),
  p.obj({
    t: p.l('user-left'),
    userId: UserId
  }),
  p.obj({
    t: p.l('bot-dropped-disc'),
    columnIndex: ConnectFour.ColumnIndex
  }),
  p.obj({
    t: p.l('user-started-playing'),
    userId: UserId,
    playerType: ConnectFour.PlayerType
  }),
  p.obj({
    t: p.l('user-stopped-playing'),
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
    t: p.l('user-swapped-sides'),
    userId: UserId
  }),
  p.obj({
    t: p.l('user-changed-bot-level'),
    botLevel: BotLevel,
    userId: UserId
  }),
  p.obj({
    t: p.l('time-passed'),
    now: Posix
  }),
  p.obj({
    t: p.l('user-restarted-game'),
    userId: UserId
  })
)
export type MsgCore = p.Infer<typeof MsgCore>

const EventErr = p.or(
  p.obj({
    t: p.l('not-playing')
  }),
  p.obj({
    t: p.l('move'),
    c: ConnectFour.MoveProblem
  })
)
type EventErr = p.Infer<typeof EventErr>

export const msgCoreErrorToString = ({ error }: { error: EventErr }): string => {
  switch (error.t) {
    case 'not-playing': {
      return "You're not playing"
    }
    case 'move': {
      return ConnectFour.moveProblemToString(error.c)
    }
  }
}

export const StateSetup = p.obj({
  type: p.l('setup'),
  userPlayerType: ConnectFour.PlayerType,
  botLevel: BotLevel,
  playingUserId: p.maybe(UserId)
})

export type StateSetup = p.Infer<typeof StateSetup>

export const StateGame = p.obj({
  type: p.l('game'),
  userPlayerType: ConnectFour.PlayerType,
  botLevel: BotLevel,
  playingUserId: UserId,
  columns: ConnectFour.Columns
})
export type StateGame = p.Infer<typeof StateGame>

const BaseModelCore = p.obj({
  errors: p.dict(
    EventId,
    p.and(
      MsgCore,
      p.obj({
        error: EventErr
      })
    )
  )
})

export const ModelCore = p.and(BaseModelCore, p.or(StateSetup, StateGame))
export type ModelCore = p.Infer<typeof ModelCore>

export const initCore = (input: SpaceCtx): ModelCore => {
  return {
    type: 'setup',
    botLevel: 'Medium',
    userPlayerType: 'player-one',
    playingUserId: input.space.hostId,
    errors: {}
  }
}

export const updateCore = ({
  modelCore,
  msgCore
}: {
  modelCore: ModelCore
  msgCore: WithEventId<MsgCore>
}): ModelCore => {
  switch (modelCore.type) {
    case 'setup': {
      switch (msgCore.t) {
        case 'user-started-playing': {
          return {
            ...modelCore,
            playingUserId: msgCore.userId,
            userPlayerType: msgCore.playerType
          }
        }

        case 'user-stopped-playing': {
          if (modelCore.playingUserId !== msgCore.userId) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }

          return {
            ...modelCore,
            playingUserId: null
          }
        }

        case 'user-swapped-sides': {
          if (modelCore.playingUserId !== msgCore.userId) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }

          return {
            ...modelCore,
            userPlayerType: ConnectFour.opposite[modelCore.userPlayerType]
          }
        }

        case 'user-started-game': {
          if (modelCore.playingUserId !== msgCore.userId) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }

          return {
            ...modelCore,
            type: 'game',
            playingUserId: modelCore.playingUserId,
            columns: ConnectFour.EMPTY_COLUMNS
          }
        }

        case 'user-changed-bot-level': {
          if (modelCore.playingUserId !== msgCore.userId) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }
          return {
            ...modelCore,
            botLevel: msgCore.botLevel
          }
        }

        case 'bot-dropped-disc': {
          return addError(modelCore, msgCore, {
            t: 'not-playing'
          })
        }

        default: {
          return modelCore
        }
      }
    }

    case 'game': {
      switch (msgCore.t) {
        case 'bot-dropped-disc': {
          const moved = ConnectFour.dropDisc(modelCore.columns, msgCore.columnIndex, toBotPlayer(modelCore))

          if (moved.t === 'err') {
            return addError(modelCore, msgCore, {
              t: 'move',
              c: moved.error
            })
          }

          return {
            ...modelCore,
            columns: moved.value
          }
        }

        case 'user-dropped-disc': {
          if (modelCore.playingUserId !== msgCore.userId) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }

          const moved = ConnectFour.dropDisc(modelCore.columns, msgCore.columnIndex, modelCore.userPlayerType)

          if (moved.t === 'err') {
            return addError(modelCore, msgCore, {
              t: 'move',
              c: moved.error
            })
          }

          return {
            ...modelCore,
            columns: moved.value
          }
        }

        case 'user-left': {
          if (msgCore.userId === modelCore.playingUserId) {
            return {
              ...modelCore,
              type: 'setup',
              botLevel: modelCore.botLevel,
              userPlayerType: modelCore.userPlayerType,
              playingUserId: null
            }
          }
          return modelCore
        }

        case 'user-stopped-game': {
          if (msgCore.userId !== modelCore.playingUserId) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }

          return {
            ...modelCore,
            type: 'setup',
            botLevel: modelCore.botLevel,
            userPlayerType: modelCore.userPlayerType,
            playingUserId: modelCore.playingUserId
          }
        }

        case 'user-swapped-sides': {
          if (msgCore.userId !== modelCore.playingUserId) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }

          return {
            ...modelCore,
            userPlayerType: ConnectFour.opposite[modelCore.userPlayerType],
            columns: ConnectFour.EMPTY_COLUMNS
          }
        }

        case 'user-restarted-game': {
          if (msgCore.userId !== modelCore.playingUserId) {
            return addError(modelCore, msgCore, {
              t: 'not-playing'
            })
          }

          return {
            ...modelCore,
            columns: ConnectFour.EMPTY_COLUMNS
          }
        }

        default: {
          return modelCore
        }
      }
    }
  }
}

const addError = (modelCore: ModelCore, msgCore: WithEventId<MsgCore>, error: EventErr): ModelCore => {
  return {
    ...modelCore,
    errors: {
      ...modelCore.errors,
      [msgCore.eventId]: {
        ...msgCore,
        error
      }
    }
  }
}

export const isBotTurn = (modelCore: ModelCore): boolean => {
  if (modelCore.type !== 'game') {
    return false
  }
  const status = ConnectFour.toStatus(modelCore.columns)
  return status.type === 'Playing' && status.turn === ConnectFour.opposite[modelCore.userPlayerType]
}

export const toBotPlayer = (modelCore: ModelCore): ConnectFour.PlayerType => {
  return ConnectFour.opposite[modelCore.userPlayerType]
}

export type GameOver = { type: 'Tie' } | { type: 'Winner'; winner: ConnectFour.PlayerType }

export const toGameOver = (model: ModelCore): GameOver | { type: null } => {
  switch (model.type) {
    case 'game': {
      const status = ConnectFour.toStatus(model.columns)
      switch (status.type) {
        case 'Playing': {
          return {
            type: null
          }
        }
        case 'Tie': {
          return {
            type: 'Tie'
          }
        }

        case 'Winner': {
          return {
            type: 'Winner',
            winner: status.winner
          }
        }

        default: {
          return {
            type: null
          }
        }
      }
    }

    case 'setup': {
      return {
        type: null
      }
    }
  }
}
