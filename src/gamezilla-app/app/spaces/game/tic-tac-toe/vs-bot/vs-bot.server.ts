import { Err, Ok, Sub, andThen, pipe, type Eff } from 'gamezilla-app/@/core'
import type { SpaceReqCtx, SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space'
import type { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { TicTacToe } from '../@/tic-tic-toe'
import {
  initCoreModel,
  isBotTurn,
  type ModelServer,
  type MsgServer,
  type MsgToClient,
  type MsgToServer
} from './vs-bot.types'

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

export const update = ({
  msg,
  model
}: {
  msg: Msg
  model: Model
}): {
  model: Model
  msgCmd?: SpaceServerCmd<MsgToClient>[]
} => {
  if (msg.t === 'bot-moved') {
    if (model.type !== 'game') {
      return {
        model,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: {
              t: 'bot-moved',
              result: Err('The bot moved not during game mode')
            }
          }
        ]
      }
    }

    const moved = TicTacToe.move({
      position: {
        column: 0,
        row: 0
      },
      board: model.board,
      player: TicTacToe.toOpposite(model.userPlayerType)
    })

    if (moved.t === 'err') {
      return {
        model,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: {
              t: 'bot-moved',
              result: moved
            }
          }
        ]
      }
    }

    const modelNew: Model = {
      ...model,
      board: moved.value
    }

    return {
      model: modelNew,
      msgCmd: [
        {
          t: 'send-to-space',
          msg: {
            t: 'bot-moved',
            result: Ok(modelNew)
          }
        }
      ]
    }
  }
  return { model }
}

//
//
//
//
//

export const updateFromClient = (input: {
  msg: MsgToServer
  model: Model
  ctx: SpaceReqCtx
}): {
  model: Model
  eff?: Eff<Msg>
  msgCmd?: SpaceServerCmd<MsgToClient>[]
} => {
  return pipe(
    input,
    andThen((model) =>
      updateFromClientMain({
        ...input,
        model
      })
    ),
    andThen((model) =>
      watchBotMove({
        model,
        modelPrev: input.model
      })
    )
  )
}

const watchBotMove = ({
  model,
  modelPrev
}: {
  model: Model
  modelPrev: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (!isBotTurn(modelPrev) && isBotTurn(model)) {
    return {
      model
    }
  }
  return { model }
}

const updateFromClientMain: typeof updateFromClient = ({ model }) => {
  // const handled = handle({ ctx, model, msg });
  return { model }
  // const res: Res = { ...msg, result: handled };
  // const modelNew: Model = handled.t === "ok" ? handled.value : model;
  // return {
  //   model: modelNew,
  //   msgCmd: [{ t: "send-to-space", msg: res }],
  // };
}

export const updateFromEvent = ({
  msg,
  model
}: {
  msg: SpaceServerEvt
  model: Model
}): {
  model: Model
  msgCmd?: SpaceServerCmd<MsgToClient>[]
} => {
  if (msg.t === 'space/user-left-space') {
    if (model.player !== msg.userId) {
      return {
        model
      }
    }

    const modelNew: Model = {
      type: 'setup',
      botLevel: model.botLevel,
      player: null,
      userPlayerType: model.userPlayerType
    }

    return {
      model: modelNew,
      msgCmd: [
        {
          t: 'send-to-space',
          msg: {
            t: 'player-left',
            result: Ok(modelNew)
          }
        }
      ]
    }
  }

  return { model }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None
}
