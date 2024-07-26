import { Sub, Time, isErr } from 'gamezilla-app/@/core'
import { TimeSpan } from 'gamezilla-app/@/core/time-span'
import { sendToClient } from 'gamezilla-app/app/@/server'
import type { SpaceReqCtx, SpaceServerEvent } from 'gamezilla-app/app/spaces/@/space'
import type { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { toOpposite, toTurn, type PlayerType } from '../@/tic-tic-toe/tic-tac-toe'
import * as Round from './vs-user-round'
import {
  NewGame,
  initCoreModel,
  inputBestOutOf,
  inputMove,
  inputPlayer,
  moveCountDown,
  rematchAccept,
  rematchAsk,
  rematchCancel,
  rematchDecline,
  resign,
  roundCountDown,
  startGame,
  stopPlaying,
  type ModelServer,
  type MsgServer,
  type MsgToClient,
  type MsgToServer,
  type Res
} from './vs-user.types'

//
//
//
// Model
//
//
//

export type Model = ModelServer

export const init = initCoreModel

//
//
//
// Update
//
//
//

export type Msg = MsgServer

export const update = (
  msg: Msg,
  model: Model
): {
  model: Model
  msgCmd: SpaceServerCmd<MsgToClient>[]
} => {
  switch (msg[0]) {
    case 'RoundCountDown': {
      const result = roundCountDown(model)

      const modelNew = isErr(result) ? model : result.value

      return {
        model: modelNew,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: ['RoundCountDown_Done', result]
          }
        ]
      }
    }

    case 'MoveCountDown': {
      const result = moveCountDown(model)

      const modelNew = isErr(result) ? model : result.value

      return {
        model: modelNew,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: ['MoveCountDown_Done', result]
          }
        ]
      }
    }
  }
}

export const updateFromClient = (
  ctx: SpaceReqCtx,
  msg: MsgToServer,
  model: Model
): {
  model: Model
  msgCmd: SpaceServerCmd<MsgToClient>[]
} => {
  switch (msg[0]) {
    case 'InputPlayer': {
      const result = inputPlayer(msg[1], model)

      if (isErr(result)) {
        return {
          model,
          msgCmd: [sendToClient(ctx, ['InputPlayer_Done', result])]
        }
      }

      const modelNew = result.value

      return {
        model: modelNew,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: ['InputPlayer_Done', result]
          }
        ]
      }
    }

    case 'stop-playing': {
      const result = stopPlaying(msg[1], model)

      if (isErr(result)) {
        return {
          model,
          msgCmd: [sendToClient(ctx, ['StopPlaying_Done', result])]
        }
      }

      const modelNew = result.value
      return {
        model: modelNew,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: ['StopPlaying_Done', result]
          }
        ]
      }
    }

    case 'start-game': {
      const result = startGame(msg[1], model)

      if (isErr(result)) {
        return {
          model,
          msgCmd: [sendToClient(ctx, ['StartGame_Done', result])]
        }
      }

      const modelNew = result.value
      return {
        model: modelNew,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: ['StartGame_Done', result]
          }
        ]
      }
    }

    case 'resign': {
      const result = resign(msg[1], model)

      if (isErr(result)) {
        return {
          model,
          msgCmd: [sendToClient(ctx, ['resign_Done', result])]
        }
      }

      const modelNew = result.value
      return {
        model: modelNew,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: ['resign_Done', result]
          }
        ]
      }
    }

    case 'input-move': {
      const result = inputMove(msg[1], model)

      if (isErr(result)) {
        return {
          model,
          msgCmd: [sendToClient(ctx, ['input-move-done', result])]
        }
      }

      const modelNew = result.value
      return {
        model: modelNew,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: ['input-move-done', result]
          }
        ]
      }
    }

    case 'NewGame': {
      const result = NewGame(msg[1], model)

      if (isErr(result)) {
        return {
          model,
          msgCmd: [sendToClient(ctx, ['NewGame_Done', result])]
        }
      }

      const modelNew = result.value

      return {
        model: modelNew,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: ['NewGame_Done', result]
          }
        ]
      }
    }

    case 'InputBestOutOf': {
      const result = inputBestOutOf(msg[1], model)

      if (isErr(result)) {
        return {
          model,
          msgCmd: [sendToClient(ctx, ['InputBestOutOf_Done', result])]
        }
      }

      const modelNew = result.value
      return {
        model: modelNew,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: ['InputBestOutOf_Done', result]
          }
        ]
      }
    }

    case 'RematchAccept': {
      const result = rematchAccept(msg[1], model)
      const res: Res = ['RematchAccept_Done', result]

      if (isErr(result)) {
        return {
          model,
          msgCmd: [sendToClient(ctx, res)]
        }
      }

      return {
        model: result.value,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: res
          }
        ]
      }
    }

    case 'RematchAsk': {
      const result = rematchAsk(msg[1], model)
      const res: Res = ['RematchAsk_Done', result]

      if (isErr(result)) {
        return {
          model,
          msgCmd: [sendToClient(ctx, res)]
        }
      }

      return {
        model: result.value,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: res
          }
        ]
      }
    }

    case 'RematchDecline': {
      const result = rematchDecline(msg[1], model)
      const res: Res = ['RematchDecline_Done', result]

      if (isErr(result)) {
        return {
          model,
          msgCmd: [sendToClient(ctx, res)]
        }
      }

      return {
        model: result.value,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: res
          }
        ]
      }
    }

    case 'Rematch_Cancel': {
      const result = rematchCancel(msg[1], model)
      const res: Res = ['Rematch_Cancel_Done', result]

      if (isErr(result)) {
        return {
          model,
          msgCmd: [sendToClient(ctx, res)]
        }
      }

      return {
        model: result.value,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: res
          }
        ]
      }
    }
  }
}

export const updateFromEvent = ({
  msg,
  model
}: {
  msg: SpaceServerEvent
  model: Model
}): {
  model: Model
  msgCmd?: SpaceServerCmd<MsgToClient>[]
} => {
  if (msg.t === 'space/user-left-space') {
    const { userId } = msg

    const player: PlayerType | 'none' = model.O === userId ? 'O' : model.X === userId ? 'X' : 'none'

    if (player === 'none') {
      return {
        model
      }
    }

    const other = toOpposite(player)

    const modelNew: Model = {
      type: 'setup',
      maxRoundCount: model.maxRoundCount,
      moveTimeLimit: model.moveTimeLimit,
      X: model.X,
      O: model.O,
      [player]: 'none',
      [other]: model[other]
    }

    return {
      model: modelNew,
      msgCmd: [
        {
          t: 'send-to-space',
          msg: ['player-left', modelNew]
        }
      ]
    }
  }

  return {
    model
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model.type) {
    case 'setup': {
      return Sub.None
    }

    case 'game-over': {
      return Sub.None
    }

    case 'game': {
      const currentRound = Round.toCurrent(model.round)

      switch (currentRound.type) {
        case 'RoundStarted': {
          const turn = toTurn(currentRound.board)
          return Time.interval(
            `${intervalId}-move-count-down-${turn}`,
            TimeSpan.seconds(1),
            (): Msg => ['MoveCountDown']
          )
        }

        case 'RoundStarting': {
          return Time.interval(`${intervalId}-round-count-down`, TimeSpan.seconds(3 / 4), (): Msg => ['RoundCountDown'])
        }

        case 'RoundOver': {
          return Sub.None
        }
      }
    }
  }
}
