import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { GameName } from './@/game-name'
import { ConnectFour } from './connect-four/frontend'
import { NumberlinkFrontend } from './numberlink/frontend'
import type { FrontendModule, MsgFrontend } from './types'

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

    case 'numberlink': {
      return {
        t: 'numberlink',
        c: NumberlinkFrontend.init,
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

    case 'numberlink': {
      const updated = NumberlinkFrontend.update({
        ctx: input.ctx,
        modelSpace: input.modelSpace.c,
        model: input.model?.t === 'numberlink' ? input.model.c : NumberlinkFrontend.init,
        msgIn: input.msgIn,
        msgSpace: input.msgSpace?.t === 'numberlink' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
        msg: input.msg?.t === 'numberlink' ? input.msg.c : null,
      })

      return {
        model: { t: 'numberlink', c: updated.model },
        eff: Eff.tag('numberlink', updated.eff),
        msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'numberlink' })),
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
      return Sub.map(
        ConnectFour.subscriptions({
          ctx: input.ctx,
          modelSpace: input.modelSpace.c,
          model: input.model.t === 'connect-four' ? input.model.c : ConnectFour.init,
        }),
        (c): MsgFrontend => ({ t: 'connect-four', c }),
      )
    }

    case 'numberlink': {
      return Sub.map(
        NumberlinkFrontend.subscriptions({
          ctx: input.ctx,
          modelSpace: input.modelSpace.c,
          model: input.model.t === 'numberlink' ? input.model.c : NumberlinkFrontend.init,
        }),
        (c): MsgFrontend => ({ t: 'numberlink', c }),
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

    case 'numberlink': {
      return (
        <NumberlinkFrontend.View
          ctx={input.ctx}
          dispatch={(c) => input.dispatch({ t: 'numberlink', c })}
          modelSpace={input.modelSpace.c}
          model={input.model.t === 'numberlink' ? input.model.c : NumberlinkFrontend.init}
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
