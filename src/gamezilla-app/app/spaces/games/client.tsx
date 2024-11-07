import { Eff, Sub } from '@/core'
import { SpaceClientCmd } from '../@/space-client-cmd'
import { GameName } from './@/game-name'
import { ConnectFour } from './connect-four/connect-four.client'
import { FlowClient } from './flow/client'
import type { ClientModule } from './types'

//
//
//
//
//
//
//

const init = (gameName: GameName): ClientModule['init'] => {
  switch (gameName) {
    case 'connect-four': {
      return {
        t: 'connect-four',
        c: ConnectFour.init
      }
    }

    case 'flow': {
      return {
        t: 'flow',
        c: FlowClient.init
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

const update: ClientModule['update'] = (input) => {
  switch (input.modelCore.t) {
    case 'connect-four': {
      const updated = ConnectFour.update({
        ctx: input.ctx,
        modelCore: input.modelCore.c,
        model: input.model?.t === 'connect-four' ? input.model.c : ConnectFour.init,
        msgCmd: input.msgCmd,
        msgEvt: input.msgEvt,
        msgServer: input.msgServer?.t === 'connect-four' ? input.msgServer.c : null,
        msgCore: input.msgCore?.t === 'connect-four' ? { ...input.msgCore, ...input.msgCore.c } : null,
        msg: input.msg?.t === 'connect-four' ? input.msg.c : null
      })

      return {
        model: { t: 'connect-four', c: updated.model },
        eff: Eff.tag('connect-four', updated.eff),
        msgCmd: SpaceClientCmd.tag('connect-four', updated.msgCmd),
        msgCore: updated.msgCore?.map((c) => ({ ...c, c, t: 'connect-four' })),
        msgEvt: updated.msgEvt
      }
    }

    case 'flow': {
      const updated = FlowClient.update({
        ctx: input.ctx,
        modelCore: input.modelCore.c,
        model: input.model?.t === 'flow' ? input.model.c : FlowClient.init,
        msgCmd: null,
        msgEvt: input.msgEvt,
        msgServer: input.msgServer?.t === 'flow' ? input.msgServer.c : null,
        msgCore: input.msgCore?.t === 'flow' ? { ...input.msgCore, ...input.msgCore.c } : null,
        msg: input.msg?.t === 'flow' ? input.msg.c : null
      })

      return {
        model: { t: 'flow', c: updated.model },
        eff: Eff.tag('flow', updated.eff),
        msgCmd: SpaceClientCmd.tag('flow', updated.msgCmd),
        msgCore: updated.msgCore?.map((c) => ({ ...c, c, t: 'flow' })),
        msgEvt: updated.msgEvt
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

const subscriptions: ClientModule['subscriptions'] = (input) => {
  const { modelCore, model } = input

  switch (modelCore.t) {
    case 'connect-four': {
      return Sub.tag(
        'connect-four',
        ConnectFour.subscriptions({
          ctx: input.ctx,
          modelCore: modelCore.c,
          model: model.t === 'connect-four' ? model.c : ConnectFour.init
        })
      )
    }

    case 'flow': {
      return Sub.tag(
        'flow',
        FlowClient.subscriptions({
          ctx: input.ctx,
          modelCore: modelCore.c,
          model: model.t === 'flow' ? model.c : FlowClient.init
        })
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

const View: ClientModule['View'] = (input) => {
  const { model, ctx, modelCore, dispatch } = input

  switch (modelCore.t) {
    case 'connect-four': {
      return (
        <ConnectFour.View
          ctx={ctx}
          dispatch={(c) =>
            dispatch({
              t: 'connect-four',
              c
            })
          }
          modelCore={modelCore.c}
          model={model?.t === 'connect-four' ? model.c : ConnectFour.init}
        />
      )
    }

    case 'flow': {
      return (
        <FlowClient.View
          ctx={ctx}
          dispatch={(c) => {
            dispatch({
              t: 'flow',
              c
            })
          }}
          modelCore={modelCore.c}
          model={model.t === 'flow' ? model.c : FlowClient.init}
        />
      )
    }
  }
}

const ViewFeedItem: ClientModule['ViewFeedItem'] = (input) => {
  const { msgCore, modelCore, ctx, dispatch } = input

  switch (modelCore.t) {
    case 'connect-four': {
      switch (msgCore.t) {
        case 'connect-four': {
          return (
            <ConnectFour.ViewFeedItem
              ctx={ctx}
              msgCore={msgCore.c}
              modelCore={modelCore.c}
              dispatch={(c) =>
                dispatch({
                  t: 'connect-four',
                  c
                })
              }
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

export const GamesClient = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem
}
