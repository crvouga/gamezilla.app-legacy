import type { UserId } from '~/app/@/data/user-id'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import * as VsBot from './vs-bot/vs-bot.backend'
import * as VsUser from './vs-user/vs-user.backend'
import type { Mode, ModelBackend, MsgBackend, MsgToBackend } from './gomoku.types'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'

//
//
//
// Model
//
//
//

export type Model = ModelBackend

export const init: Model = {
  t: 'none',
}

const initMode = ({ mode, userId }: { mode: Mode; userId: UserId }): Model => {
  switch (mode) {
    case 'none': {
      return {
        t: 'none',
      }
    }

    case 'vs-bot': {
      return {
        t: 'vs-bot',
        c: VsBot.init({
          userId,
        }),
      }
    }

    case 'vs-user': {
      return {
        t: 'vs-user',
        c: VsUser.init({
          white: userId,
          black: null,
        }),
      }
    }
  }
}

//
//
//
// update
//
//
//

export type Msg = MsgBackend

export const update = ({ msg, model }: { msg: Msg; model: Model }): { model: Model; eff?: Eff<Msg> } => {
  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.update({
      msg: msg.c,
      model: model.c,
    })
    return {
      model: {
        t: 'vs-bot',
        c: updated.model,
      },
      eff: Eff.tag('vs-bot', updated.eff),
    }
  }

  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.update({
      msg: msg.c,
      model: model.c,
    })
    return {
      model: {
        t: 'vs-user',
        c: updated.model,
      },
      eff: Eff.tag('vs-user', updated.eff),
    }
  }

  return { model }
}

export const updateFromFrontend = ({
  ctx,
  msg,
  model,
}: {
  ctx: SpaceBackendCtx
  msg: MsgToBackend
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === 'input-mode') {
    const modelNew = initMode(msg)
    return {
      model: modelNew,
      eff: Eff.None,
    }
  }

  if (model.t === 'vs-bot' && msg.t === 'vs-bot') {
    const updated = VsBot.updateFromFrontend({
      ctx,
      msg: msg.c,
      model: model.c,
    })
    return {
      model: {
        t: 'vs-bot',
        c: updated.model,
      },
      eff: Eff.tag('vs-bot', updated.eff),
    }
  }

  if (model.t === 'vs-user' && msg.t === 'vs-user') {
    const updated = VsUser.updateFromFrontend({
      msg: msg.c,
      model: model.c,
      ctx,
    })

    return {
      model: {
        t: 'vs-user',
        c: updated.model,
      },
      eff: Eff.tag('vs-user', updated.eff),
    }
  }

  return { model }
}

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceBackendEvt
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (model.t === 'vs-bot') {
    const updated = VsBot.updateFromEvent({
      msg,
      model: model.c,
    })
    return {
      model: {
        t: 'vs-bot',
        c: updated.model,
      },
      eff: Eff.tag('vs-bot', updated.eff),
    }
  }

  if (model.t === 'vs-user') {
    const updated = VsUser.updateFromEvent({
      msg,
      model: model.c,
    })
    return {
      model: {
        t: 'vs-user',
        c: updated.model,
      },
      eff: Eff.tag('vs-user', updated.eff),
    }
  }

  return {
    model,
  }
}

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.none()
}
