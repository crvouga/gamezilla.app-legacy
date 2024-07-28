import { Sub } from 'gamezilla-app/@/core'
import type { ClientCmd } from 'gamezilla-app/app/@/client'
import type { GameClient } from 'gamezilla-app/app/spaces/@/architecture/game-client'
import type { SpaceClientCtx, SpaceClientEvt } from 'gamezilla-app/app/spaces/@/space'
import { GameMainMenu } from 'gamezilla-app/app/spaces/game/@/game'
import { CoverArt } from './@/tic-tic-toe/tic-tac-toe-ui'
import type { ModelClient, MsgClient, MsgToClient, MsgToServer } from './tic-tac-toe.types'
import * as VsBot from './vs-bot/vs-bot.client'
import * as VsUser from './vs-user/vs-user.client'

type Client = GameClient<{
  ModelClient: ModelClient
  MsgClient: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgCore: null
  ModelCore: null
  ClientCtx: SpaceClientCtx
  ClientCmd: ClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
  ClientEvent: SpaceClientEvt
}>

//
//
//
// Model
//
//
//

export const init: Client['init'] = ({ model }) => {
  if (model) {
    return { model }
  }

  return { model: { t: 'none' } }
}

//
//
// Update
//
//
//

export const update: Client['update'] = (input) => {
  return init(input)
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client['subscriptions'] = () => {
  return Sub.None
}

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  model,
  dispatch
}: {
  ctx: SpaceClientCtx
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  const onQuit = () =>
    dispatch({
      t: 'input-mode',
      mode: 'none'
    })

  if (model.t === 'none') {
    return (
      <GameMainMenu.View
        dispatch={dispatch}
        title={ctx.t('tic-tac-toe')}
        ctx={ctx}
        renderCoverArt={(input) => <CoverArt {...input} key={input.key} />}
        buttons={[
          GameMainMenu.buttons.playFriend({
            ctx,
            onClick: () =>
              dispatch({
                t: 'input-mode',
                mode: 'vs-user'
              })
          }),
          GameMainMenu.buttons.playComputer({
            ctx,
            onClick: () =>
              dispatch({
                t: 'input-mode',
                mode: 'vs-bot'
              })
          })
        ]}
      />
    )
  }

  if (model.t === 'vs-user') {
    return (
      <VsUser.View
        onCloseGame={onQuit}
        ctx={ctx}
        model={model.c}
        dispatch={(c) =>
          dispatch({
            t: 'vs-user',
            c
          })
        }
      />
    )
  }

  if (model.t === 'vs-bot') {
    return (
      <VsBot.View
        goBack={onQuit}
        ctx={ctx}
        model={model.c}
        dispatch={(c) =>
          dispatch({
            t: 'vs-bot',
            c
          })
        }
      />
    )
  }

  const check: never = model
  return check
}
