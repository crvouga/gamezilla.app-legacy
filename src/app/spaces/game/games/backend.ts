import { Sub } from '~/@/sub'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/space-backend/ctx'
import { GameName } from './@/game-name'
import { ConnectFourBackend } from './connect-four/connect-four.backend'
import { FlowBackend } from './flow/backend'
import type { GameBackendCtx, BackendModule } from './types'

const initCtx = (input: { ctx: SpaceBackendCtx }): GameBackendCtx => {
  return {
    ...input.ctx,
    flow: FlowBackend.initCtx(input),
  }
}

//
//
//
// Model
//
//
//

const init = (gameName: GameName): BackendModule['init'] => {
  switch (gameName) {
    case 'connect-four': {
      return {
        t: 'connect-four',
        c: ConnectFourBackend.init,
      }
    }

    case 'flow': {
      return {
        t: 'flow',
        c: FlowBackend.init,
      }
    }

    default: {
      return {
        t: 'connect-four',
        c: ConnectFourBackend.init,
      }
    }
  }
}

//
//
//
// Update
//
//
//

const update: BackendModule['update'] = async (input) => {
  switch (input.modelSpace.t) {
    case 'flow': {
      const updated = await FlowBackend.update({
        ctx: input.ctx.flow,
        modelSpace: input.modelSpace.c,
        msgCmd: input.msgCmd,
        msgEvt: input.msgEvt,
        msgFrontend: input.msgFrontend?.t === 'flow' ? { ...input.msgFrontend, ...input.msgFrontend.c } : null,
        msgSpace: input.msgSpace?.t === 'flow' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
        msg: input.msg?.t === 'flow' ? input.msg.c : null,
        deps: null,
      })

      return GameBackendModule.tagOutput('flow', (msgCmd) => SpaceBackendCmd.tag('flow', msgCmd), updated)
    }

    case 'connect-four': {
      const updated = await ConnectFourBackend.update({
        ctx: input.ctx,
        modelSpace: input.modelSpace.c,
        msgCmd: input.msgCmd,
        msgEvt: input.msgEvt,
        msgFrontend: input.msgFrontend?.t === 'connect-four' ? { ...input.msgFrontend, ...input.msgFrontend.c } : null,
        msgSpace: input.msgSpace?.t === 'connect-four' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
        msg: input.msg?.t === 'connect-four' ? input.msg.c : null,
        deps: null,
      })

      return GameBackendModule.tagOutput(
        'connect-four',
        (msgCmd) => SpaceBackendCmd.tag('connect-four', msgCmd),
        updated,
      )
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

const subscriptions: BackendModule['subscriptions'] = async (input) => {
  switch (input.modelSpace.t) {
    case 'connect-four': {
      return Sub.tag(
        'connect-four',
        await ConnectFourBackend.subscriptions({ ...input, modelSpace: input.modelSpace.c }),
      )
    }

    case 'flow': {
      return Sub.tag(
        'flow',
        await FlowBackend.subscriptions({
          ...input,
          modelSpace: input.modelSpace.c,
          ctx: input.ctx.flow,
        }),
      )
    }
  }
}

export const GamesBackend = {
  init,
  update,
  subscriptions,
  initCtx,
}
