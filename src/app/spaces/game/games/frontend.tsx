import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { GameName } from './@/game-name'
import { ConnectFour } from './connect-four/connect-four.frontend'
import { FlowFrontend } from './flow/frontend'
import type { FrontendModule } from './types'

//
//
//
//
//
//
//

const init = (gameName: GameName): FrontendModule['init'] => {
  switch (gameName) {
    case 'connect-four': {
      return {
        t: 'connect-four',
        c: ConnectFour.init,
      }
    }

    case 'flow': {
      return {
        t: 'flow',
        c: FlowFrontend.init,
      }
    }

    default: {
      throw new Error(`Unknown game name: ${gameName}`)
    }
  }
}

//
//
//
//
//
//
//

const update: FrontendModule['update'] = (input) => {
  switch (input.modelSpace.t) {
    case 'connect-four': {
      const updated = ConnectFour.update({
        ctx: input.ctx,
        modelSpace: input.modelSpace.c,
        model: input.model?.t === 'connect-four' ? input.model.c : ConnectFour.init,
        msgIn: input.msgIn,
        msgBackend: input.msgBackend?.t === 'connect-four' ? input.msgBackend.c : null,
        msgSpace: input.msgSpace?.t === 'connect-four' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
        msg: input.msg?.t === 'connect-four' ? input.msg.c : null,
      })

      return {
        model: { t: 'connect-four', c: updated.model },
        eff: Eff.tag('connect-four', updated.eff),
        msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'connect-four' })),
        msgOut: updated.msgOut,
      }
    }

    case 'flow': {
      const updated = FlowFrontend.update({
        ctx: input.ctx,
        modelSpace: input.modelSpace.c,
        model: input.model?.t === 'flow' ? input.model.c : FlowFrontend.init,
        msgIn: input.msgIn,
        msgBackend: input.msgBackend?.t === 'flow' ? input.msgBackend.c : null,
        msgSpace: input.msgSpace?.t === 'flow' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
        msg: input.msg?.t === 'flow' ? input.msg.c : null,
      })

      return {
        model: { t: 'flow', c: updated.model },
        eff: Eff.tag('flow', updated.eff),
        msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'flow' })),
        msgOut: updated.msgOut,
      }
    }
  }
}

//
//
//
//
//
//
//

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  switch (input.modelSpace.t) {
    case 'connect-four': {
      return Sub.tag(
        'connect-four',
        ConnectFour.subscriptions({
          ctx: input.ctx,
          modelSpace: input.modelSpace.c,
          model: input.model.t === 'connect-four' ? input.model.c : ConnectFour.init,
        }),
      )
    }

    case 'flow': {
      return Sub.tag(
        'flow',
        FlowFrontend.subscriptions({
          ctx: input.ctx,
          modelSpace: input.modelSpace.c,
          model: input.model.t === 'flow' ? input.model.c : FlowFrontend.init,
        }),
      )
    }
  }
}

//
//
//
//
//
//
//

const View: FrontendModule['View'] = (input) => {
  switch (input.modelSpace.t) {
    case 'connect-four': {
      return (
        <ConnectFour.View
          ctx={input.ctx}
          dispatch={(c) => input.dispatch({ t: 'connect-four', c })}
          modelSpace={input.modelSpace.c}
          model={input.model?.t === 'connect-four' ? input.model.c : ConnectFour.init}
        />
      )
    }

    case 'flow': {
      return (
        <FlowFrontend.View
          ctx={input.ctx}
          dispatch={(c) => input.dispatch({ t: 'flow', c })}
          modelSpace={input.modelSpace.c}
          model={input.model.t === 'flow' ? input.model.c : FlowFrontend.init}
        />
      )
    }
  }
}

const ViewFeedItem: FrontendModule['ViewFeedItem'] = (input) => {
  switch (input.modelSpace.t) {
    case 'connect-four': {
      switch (input.msgSpace.t) {
        case 'connect-four': {
          return (
            <ConnectFour.ViewFeedItem
              ctx={input.ctx}
              msgSpace={input.msgSpace.c}
              modelSpace={input.modelSpace.c}
              dispatch={(c) => input.dispatch({ t: 'connect-four', c })}
            />
          )
        }
        default: {
          return null
        }
      }
    }

    default: {
      return null
    }
  }
}

export const GamesFrontend = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem,
}
