import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import type { UserId } from '~/app/@/data/user-id'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import type { ModelBackend, MsgBackend, MsgToBackend } from './tic-tac-toe.types'
import * as VsBot from './vs-bot/vs-bot.backend'
import * as VsUser from './vs-user/vs-user.backend'

//
//
//
// Model
//
//
//

export type Model = ModelBackend

export const init: Model = { t: 'none' }

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
  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.update(msg.c, model.c)
    return {
      model: {
        t: 'vs-user',
        c: updated.model,
      },
    }
  }

  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.update({
      model: model.c,
      msg: msg.c,
    })

    return {
      model: {
        t: 'vs-bot',
        c: updated.model,
      },
    }
  }

  return { model }
}

export const updateFromFrontend = ({
  msg,
  model,
  ctx,
}: {
  ctx: SpaceBackendCtx
  msg: MsgToBackend
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === 'input-mode') {
    const modelNew: ModelBackend = initMode({
      mode: msg.mode,
      userId: ctx.space.hostId,
    })

    return {
      model: modelNew,
    }
  }

  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.updateFromFrontend(ctx, msg.c, model.c)

    return {
      model: {
        ...model,
        c: updated.model,
      },
      
    }
  }

  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.updateFromFrontend({
      msg: msg.c,
      model: model.c,
      ctx,
    })

    return {
      model: {
        ...model,
        c: updated.model,
      },
      eff: Eff.tag('vs-bot', updated.eff),
      
    }
  }

  return { model }
}

export const updateFromEvent = ({
  msg,
  model,
}: {
  model: Model
  msg: SpaceBackendEvt
}): {
  model: Model
  
} => {
  if (model.t === 'none') {
    return { model }
  }

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
      
    }
  }

  return { model }
}

const initMode = ({ mode, userId }: { mode: ModelBackend['t']; userId: UserId }): ModelBackend => {
  switch (mode) {
    case 'none': {
      return {
        t: 'none',
      }
    }

    case 'vs-user': {
      return {
        t: 'vs-user',
        c: VsUser.init({
          X: userId,
          O: 'none',
        }),
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
  switch (model.t) {
    case 'vs-bot': {
      return Sub.tag('vs-bot', VsBot.subscriptions(model.c))
    }
    case 'vs-user': {
      return Sub.tag('vs-user', VsUser.subscriptions(intervalId, model.c))
    }
    case 'none': {
      return Sub.None
    }
  }
}
