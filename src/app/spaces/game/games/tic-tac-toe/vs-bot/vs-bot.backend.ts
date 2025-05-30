import { Eff } from '~/@/eff'
import { pipe } from '~/@/function/pipe'
import { Sub } from '~/@/sub'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import { TicTacToe } from '../@/tic-tic-toe'
import { initSpaceModel, isBotTurn, type ModelBackend, type MsgBackend, type MsgToBackend } from './vs-bot.types'

//
//
//
// Model
//
//
//

export type Model = ModelBackend

export const init = initSpaceModel

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
} => {
  if (msg.t === 'bot-moved') {
    if (model.type !== 'game') {
      return {
        model,
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
      }
    }

    const modelNew: Model = {
      ...model,
      board: moved.value,
    }

    return {
      model: modelNew,
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
