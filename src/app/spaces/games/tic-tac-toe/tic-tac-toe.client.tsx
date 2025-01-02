import { Sub } from '~/@/sub'
import { AppClientCmd } from '~/app/@/client/cmd'
import type { GameClient } from '~/app/spaces/games/@/architecture/game-client'
import { SpaceClientCtx } from '../../@/space-client/ctx'
import { SpaceClientEvt } from '../../@/space-client/evt'
import { GameMainMenu } from '../@/game/game-main-menu'
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
  ClientCmd: AppClientCmd<{
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
        onBack={() => dispatch({ t: 'game-main-menu/clicked-exit-game-button' })}
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
