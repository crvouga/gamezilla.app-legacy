import { Eff } from '~/@/eff'
import { pipe } from '~/@/function/pipe'
import { Sub } from '~/@/sub'

import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'

import { Chess } from '../@/chess'
import { botMoved, initBackend, isBotTurn, type ModelBackend, type MsgBackend, type MsgToBackend } from './vs-bot.types'

//
//
//
// Model
//
//
//

export type Model = ModelBackend

export const init = initBackend

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
  eff?: Eff<Msg>
} => {
  if (msg.t === 'bot-moved') {
    const result = botMoved(msg.moved, model)

    const modelNew = result.t === 'err' ? model : result.value

    return {
      model: modelNew,
    }
  }

  return { model }
}

export const updateFromFrontend = (input: {
  msg: MsgToBackend
  model: Model
  ctx: SpaceBackendCtx
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  const updated = updateFromFrontendMain(input)

  return {
    ...updated,
    eff: Eff.batch([updated.eff, toBotMoveEff(input.model, updated.model)]),
  }
}

const toBotMoveEff = (modelPrev: Model, modelNext: Model): Eff<Msg> => {
  const didChangeToBotTurn = !isBotTurn(modelPrev) && isBotTurn(modelNext)

  if (!didChangeToBotTurn) {
    return Eff.None
  }
  if (modelNext.type !== 'game') {
    return Eff.None
  }

  const eff = pipe(
    Chess.getBestMove(modelNext.botLevel, modelNext.board),
    Eff.perform(
      (moved): Msg => ({
        t: 'bot-moved',
        moved,
      }),
    ),
  )

  return eff
}

const updateFromFrontendMain: typeof updateFromFrontend = ({ model }) => {
  // const handled = updateSpace({ msg, model });

  // const modelNew: Model = handled.t === "err" ? model : handled.value;

  // return {
  //   model: modelNew,
  //   msgCmd: [{ t: "send-to-space", msg: { ...msg, result: handled } }],
  // };
  return { model }
}

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: Record<string, unknown>
  model: Model
}): {
  model: Model
  eff?: Eff
} => {
  if (msg.t === 'space-evt.userLeftSpace') {
    if (model.userId === msg.userId) {
      const modelNew: Model = {
        type: 'setup',
        botLevel: model.botLevel,
        userColor: model.userColor,
        userId: null,
      }
      return {
        model: modelNew,
      }
    }
    return { model }
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

export const subscriptions = (_intervalId: string, _model: Model): Sub<Msg> => {
  return Sub.none()
}
