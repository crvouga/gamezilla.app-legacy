import { Err, Ok } from '~/@/result'
import { pipe } from '~/@/function/pipe'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/space-backend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import { TicTacToe } from '../@/tic-tic-toe'
import {
  initCoreModel,
  isBotTurn,
  type ModelBackend,
  type MsgBackend,
  type MsgToFrontend,
  type MsgToBackend,
} from './vs-bot.types'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'

//
//
//
// Model
//
//
//

export type Model = ModelBackend

export const init = initCoreModel

//
//
//
// Update
//
//
//

export type Msg = MsgBackend

export const update = ({
  msg,
  model,
}: {
  msg: Msg
  model: Model
}): {
  model: Model
  msgCmd?: SpaceBackendCmd<MsgToFrontend>[]
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
              result: Err('The bot moved not during game mode'),
            },
          },
        ],
      }
    }

    const moved = TicTacToe.move({
      position: {
        column: 0,
        row: 0,
      },
      board: model.board,
      player: TicTacToe.toOpposite(model.userPlayerType),
    })

    if (moved.t === 'err') {
      return {
        model,
        msgCmd: [
          {
            t: 'send-to-space',
            msg: {
              t: 'bot-moved',
              result: moved,
            },
          },
        ],
      }
    }

    const modelNew: Model = {
      ...model,
      board: moved.value,
    }

    return {
      model: modelNew,
      msgCmd: [
        {
          t: 'send-to-space',
          msg: {
            t: 'bot-moved',
            result: Ok(modelNew),
          },
        },
      ],
    }
  }
  return { model }
}

//
//
//
//
//

export const updateFromFrontend = (input: {
  msg: MsgToBackend
  model: Model
  ctx: SpaceBackendCtx
}): {
  model: Model
  eff?: Eff<Msg>
  msgCmd?: SpaceBackendCmd<MsgToFrontend>[]
} => {
  return pipe(
    input,
    // andThen((model) =>
    //   updateFromFrontendMain({
    //     ...input,
    //     model
    //   })
    // ),
    // andThen((model) =>
    //   watchBotMove({
    //     model,
    //     modelPrev: input.model
    //   })
    // )
  )
}

export const watchBotMove = ({
  model,
  modelPrev,
}: {
  model: Model
  modelPrev: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (!isBotTurn(modelPrev) && isBotTurn(model)) {
    return {
      model,
    }
  }
  return { model }
}

export const updateFromFrontendMain: typeof updateFromFrontend = ({ model }) => {
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
  model,
}: {
  msg: SpaceBackendEvt
  model: Model
}): {
  model: Model
  msgCmd?: SpaceBackendCmd<MsgToFrontend>[]
} => {
  if (msg.t === 'space-evt.user-left-space') {
    if (model.player !== msg.userId) {
      return {
        model,
      }
    }

    const modelNew: Model = {
      type: 'setup',
      botLevel: model.botLevel,
      player: null,
      userPlayerType: model.userPlayerType,
    }

    return {
      model: modelNew,
      msgCmd: [
        {
          t: 'send-to-space',
          msg: {
            t: 'player-left',
            result: Ok(modelNew),
          },
        },
      ],
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
