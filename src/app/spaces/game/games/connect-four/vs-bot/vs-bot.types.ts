import { s } from '~/@/schema'
import { EventId, type WithEventId } from '~/@/event-sourced/event'
import { UnixMs } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { UserId } from '~/app/@/data/user-id'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import type { VsBotGame, VsBotSetup } from '~/app/spaces/game/games/@/vs-bot'
import * as ConnectFour from '../@/connect-four'
import { BotLevel } from './bot-level'

//
//
// Model
//
//

export const ModelBackend = s.obj({
  botStartedFindingMoveAt: s.maybe(UnixMs),
})
export type ModelBackend = s.Infer<typeof ModelBackend>

export const isBotMoving = (now: UnixMs, model: ModelBackend) => {
  if (!model.botStartedFindingMoveAt) {
    return false
  }
  return TimeSpan.lte(UnixMs.diff(now, model.botStartedFindingMoveAt), TimeSpan.seconds(5))
}

export type ModelFrontend = {
  vsBotSetup: VsBotSetup.Model
  vsBotGame: VsBotGame.Model
}

//
//
// Msg
//
//

export type MsgFrontend = MsgSpace | { t: 'vs-bot-setup'; c: VsBotSetup.Msg } | { t: 'vs-bot-game'; c: VsBotGame.Msg }

export type MsgBackend =
  | {
      t: 'bot-found-best-move'
      found: ConnectFour.BestMoveResult
      startedAt: UnixMs
    }
  | {
      t: 'time-passed'
    }

export type MsgToFrontend = { t: null }

export type MsgToBackend = { t: null }

export const MsgSpace = s.or(
  s.obj({
    t: s.l('user-dropped-disc'),
    columnIndex: ConnectFour.ColumnIndex,
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-left'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('bot-dropped-disc'),
    columnIndex: ConnectFour.ColumnIndex,
  }),
  s.obj({
    t: s.l('user-started-playing'),
    userId: UserId,
    playerType: ConnectFour.PlayerType,
  }),
  s.obj({
    t: s.l('user-stopped-playing'),
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
    t: s.l('user-swapped-sides'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-changed-bot-level'),
    botLevel: BotLevel,
    userId: UserId,
  }),
  s.obj({
    t: s.l('time-passed'),
    now: UnixMs,
  }),
  s.obj({
    t: s.l('user-restarted-game'),
    userId: UserId,
  }),
)
export type MsgSpace = s.Infer<typeof MsgSpace>

const EventErr = s.or(
  s.obj({
    t: s.l('not-playing'),
  }),
  s.obj({
    t: s.l('move'),
    c: ConnectFour.MoveProblem,
  }),
)
type EventErr = s.Infer<typeof EventErr>

export const msgSpaceErrorToString = ({ error }: { error: EventErr }): string => {
  switch (error.t) {
    case 'not-playing': {
      return "You're not playing"
    }
    case 'move': {
      return ConnectFour.moveProblemToString(error.c)
    }
  }
}

export const StateSetup = s.obj({
  type: s.l('setup'),
  userPlayerType: ConnectFour.PlayerType,
  botLevel: BotLevel,
  playingUserId: s.maybe(UserId),
})

export type StateSetup = s.Infer<typeof StateSetup>

export const StateGame = s.obj({
  type: s.l('game'),
  userPlayerType: ConnectFour.PlayerType,
  botLevel: BotLevel,
  playingUserId: UserId,
  columns: ConnectFour.Columns,
})
export type StateGame = s.Infer<typeof StateGame>

const BaseModelSpace = s.obj({
  errors: s.dict(
    EventId,
    s.and(
      MsgSpace,
      s.obj({
        error: EventErr,
      }),
    ),
  ),
})

export const ModelSpace = s.and(BaseModelSpace, s.or(StateSetup, StateGame))
export type ModelSpace = s.Infer<typeof ModelSpace>

export const initSpace = (input: SpaceCtx): ModelSpace => {
  return {
    type: 'setup',
    botLevel: 'Medium',
    userPlayerType: 'player-one',
    playingUserId: input.space.hostId,
    errors: {},
  }
}

export const updateSpace = ({
  modelSpace,
  msgSpace,
}: {
  modelSpace: ModelSpace
  msgSpace: WithEventId<MsgSpace>
}): ModelSpace => {
  switch (modelSpace.type) {
    case 'setup': {
      switch (msgSpace.t) {
        case 'user-started-playing': {
          return {
            ...modelSpace,
            playingUserId: msgSpace.userId,
            userPlayerType: msgSpace.playerType,
          }
        }

        case 'user-stopped-playing': {
          if (modelSpace.playingUserId !== msgSpace.userId) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }

          return {
            ...modelSpace,
            playingUserId: null,
          }
        }

        case 'user-swapped-sides': {
          if (modelSpace.playingUserId !== msgSpace.userId) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }

          return {
            ...modelSpace,
            userPlayerType: ConnectFour.opposite[modelSpace.userPlayerType],
          }
        }

        case 'user-started-game': {
          if (modelSpace.playingUserId !== msgSpace.userId) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }

          return {
            ...modelSpace,
            type: 'game',
            playingUserId: modelSpace.playingUserId,
            columns: ConnectFour.EMPTY_COLUMNS,
          }
        }

        case 'user-changed-bot-level': {
          if (modelSpace.playingUserId !== msgSpace.userId) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }
          return {
            ...modelSpace,
            botLevel: msgSpace.botLevel,
          }
        }

        case 'bot-dropped-disc': {
          return addError(modelSpace, msgSpace, {
            t: 'not-playing',
          })
        }

        default: {
          return modelSpace
        }
      }
    }

    case 'game': {
      switch (msgSpace.t) {
        case 'bot-dropped-disc': {
          const moved = ConnectFour.dropDisc(modelSpace.columns, msgSpace.columnIndex, toBotPlayer(modelSpace))

          if (moved.t === 'err') {
            return addError(modelSpace, msgSpace, {
              t: 'move',
              c: moved.error,
            })
          }

          return {
            ...modelSpace,
            columns: moved.value,
          }
        }

        case 'user-dropped-disc': {
          if (modelSpace.playingUserId !== msgSpace.userId) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }

          const moved = ConnectFour.dropDisc(modelSpace.columns, msgSpace.columnIndex, modelSpace.userPlayerType)

          if (moved.t === 'err') {
            return addError(modelSpace, msgSpace, {
              t: 'move',
              c: moved.error,
            })
          }

          return {
            ...modelSpace,
            columns: moved.value,
          }
        }

        case 'user-left': {
          if (msgSpace.userId === modelSpace.playingUserId) {
            return {
              ...modelSpace,
              type: 'setup',
              botLevel: modelSpace.botLevel,
              userPlayerType: modelSpace.userPlayerType,
              playingUserId: null,
            }
          }
          return modelSpace
        }

        case 'user-stopped-game': {
          if (msgSpace.userId !== modelSpace.playingUserId) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }

          return {
            ...modelSpace,
            type: 'setup',
            botLevel: modelSpace.botLevel,
            userPlayerType: modelSpace.userPlayerType,
            playingUserId: modelSpace.playingUserId,
          }
        }

        case 'user-swapped-sides': {
          if (msgSpace.userId !== modelSpace.playingUserId) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }

          return {
            ...modelSpace,
            userPlayerType: ConnectFour.opposite[modelSpace.userPlayerType],
            columns: ConnectFour.EMPTY_COLUMNS,
          }
        }

        case 'user-restarted-game': {
          if (msgSpace.userId !== modelSpace.playingUserId) {
            return addError(modelSpace, msgSpace, {
              t: 'not-playing',
            })
          }

          return {
            ...modelSpace,
            columns: ConnectFour.EMPTY_COLUMNS,
          }
        }

        default: {
          return modelSpace
        }
      }
    }
  }
}

const addError = (modelSpace: ModelSpace, msgSpace: WithEventId<MsgSpace>, error: EventErr): ModelSpace => {
  return {
    ...modelSpace,
    errors: {
      ...modelSpace.errors,
      [msgSpace.eventId]: {
        ...msgSpace,
        error,
      },
    },
  }
}

export const isBotTurn = (modelSpace: ModelSpace): boolean => {
  if (modelSpace.type !== 'game') {
    return false
  }
  const status = ConnectFour.toStatus(modelSpace.columns)
  return status.type === 'Playing' && status.turn === ConnectFour.opposite[modelSpace.userPlayerType]
}

export const toBotPlayer = (modelSpace: ModelSpace): ConnectFour.PlayerType => {
  return ConnectFour.opposite[modelSpace.userPlayerType]
}

export type GameOver = { type: 'Tie' } | { type: 'Winner'; winner: ConnectFour.PlayerType }

export const toGameOver = (model: ModelSpace): GameOver | { type: null } => {
  switch (model.type) {
    case 'game': {
      const status = ConnectFour.toStatus(model.columns)
      switch (status.type) {
        case 'Playing': {
          return {
            type: null,
          }
        }
        case 'Tie': {
          return {
            type: 'Tie',
          }
        }

        case 'Winner': {
          return {
            type: 'Winner',
            winner: status.winner,
          }
        }

        default: {
          return {
            type: null,
          }
        }
      }
    }

    case 'setup': {
      return {
        type: null,
      }
    }
  }
}
