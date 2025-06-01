import { Sub } from '~/@/sub'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import type { GameFrontend } from '~/app/spaces/game/games/@/architecture/game-frontend'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { CoverArt } from './@/tic-tic-toe/tic-tac-toe-ui'
import type { ModelFrontend, MsgFrontend, MsgToBackend, MsgToFrontend } from './tic-tac-toe.types'
import * as VsBot from './vs-bot/vs-bot.frontend'
import * as VsUser from './vs-user/vs-user.frontend'

type Frontend = GameFrontend<{
  ModelFrontend: ModelFrontend
  MsgFrontend: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  MsgSpace: null
  ModelSpace: null
  FrontendCtx: SpaceFrontendCtx
}>

//
//
//
// Model
//
//
//

export const init: Frontend['init'] = ({ model }) => {
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

export const update: Frontend['update'] = (input) => {
  return init(input)
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Frontend['subscriptions'] = () => {
  return Sub.none()
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
  dispatch,
}: {
  ctx: SpaceFrontendCtx
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
  const onQuit = () =>
    dispatch({
      t: 'input-mode',
      mode: 'none',
    })

  if (model.t === 'none') {
    return (
      <GameMainMenu.View
        dispatch={dispatch}
        title={ctx.t('tic-tac-toe')}
        onBack={() => dispatch({ t: 'game-main-menu.clicked-exit-game-button' })}
        ctx={ctx}
        renderCoverArt={(input) => <CoverArt {...input} />}
        buttons={[
          GameMainMenu.buttons.playFriend({
            ctx,
            onClick: () =>
              dispatch({
                t: 'input-mode',
                mode: 'vs-user',
              }),
          }),
          GameMainMenu.buttons.playComputer({
            ctx,
            onClick: () =>
              dispatch({
                t: 'input-mode',
                mode: 'vs-bot',
              }),
          }),
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
            c,
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
            c,
          })
        }
      />
    )
  }

  const check: never = model
  return check
}
