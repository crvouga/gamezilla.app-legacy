import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { FlowFrontendCmd } from '../@/frontend/cmd'
import { PackLoaderFrontend } from '../@/pack/pack-loader/frontend'
import { PuzzleLoaderFrontend } from '../@/puzzle/puzzle-loader/frontend'
import { ScreenPackBuilderOpenFrontend } from './pack-builder/screen-pack-builder-open/frontend'
import { ScreenPackBuilderFrontend } from './pack-builder/screen-pack-builder/frontend'
import { ScreenPuzzleBuilderOpenFrontend } from './puzzle-builder/screen-puzzle-builder-open/frontend'
import { ScreenPuzzleBuilderFrontend } from './puzzle-builder/screen-puzzle-builder/frontend'
import { ScreenMainMenuFrontend } from './screen-main-menu/frontend'
import { initFrontend, type FrontendModule } from './types'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => ScreenPackBuilderOpenFrontend.update({ ...input, model }),
    (model) => ScreenPuzzleBuilderFrontend.update({ ...input, model }),
    (model) => ScreenPuzzleBuilderOpenFrontend.update({ ...input, model }),
    (model) => ScreenMainMenuFrontend.update({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateBackButton({ ...input, model }),
    (model) => updateScreenPackBuilder({ ...input, model }),
  )
}

const updateScreenPackBuilder: FrontendModule['update'] = (input) => {
  if (!input.modelSpace.screenPackBuilder) {
    return { model: input.model }
  }
  const updated = ScreenPackBuilderFrontend.update({
    ...input,
    modelSpace: input.modelSpace.screenPackBuilder,
    model: input.model,
    msg: input.msg?.t === 'got-screen-pack-builder-msg' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'got-screen-pack-builder-msg' ? input.msgBackend.c : null,
    msgSpace: input.msgSpace?.t === 'got-screen-pack-builder-msg' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
  })
  return {
    model: {
      ...input.model,
      screenPackBuilder: updated,
    },
    eff: Eff.tag('got-screen-pack-builder-msg', updated.eff),
    msgCmd: FlowFrontendCmd.tag('got-screen-pack-builder-msg', updated.msgCmd),
    msgEvt: updated.msgEvt,
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, t: 'got-screen-pack-builder-msg', c })),
  }
}

const updateBackButton: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-clicked-back-button': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      }
    }
    default: {
      return {
        model: input.model,
      }
    }
  }
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-space': {
      return { model: input.model, msgSpace: [input.msg.c] }
    }
    case 'got-pack-loader-msg': {
      return { model: input.model, msgCmd: [PackLoaderFrontend.gotMsg(input.msg.c)] }
    }
    case 'got-puzzle-loader-msg': {
      return { model: input.model, msgCmd: [PuzzleLoaderFrontend.gotMsg(input.msg.c)] }
    }
    default: {
      return {
        model: input.model,
      }
    }
  }
}

const View: FrontendModule['View'] = (input) => {
  switch (input.modelSpace.screen.t) {
    case 'screen-main-menu': {
      return <ScreenMainMenuFrontend.View {...input} />
    }

    case 'screen-puzzle-builder': {
      return <ScreenPuzzleBuilderFrontend.View {...input} />
    }

    case 'screen-pack-builder-open': {
      return <ScreenPackBuilderOpenFrontend.View {...input} />
    }

    case 'screen-puzzle-builder-open': {
      return <ScreenPuzzleBuilderOpenFrontend.View {...input} />
    }

    case 'screen-pack-builder': {
      if (!input.modelSpace.screenPackBuilder) {
        return null
      }
      return (
        <ScreenPackBuilderFrontend.View
          {...input}
          dispatch={(c) => input.dispatch({ t: 'got-screen-pack-builder-msg', c })}
          model={input.model}
          modelSpace={input.modelSpace.screenPackBuilder}
        />
      )
    }
  }
}

const ViewFeedItem: FrontendModule['ViewFeedItem'] = () => {
  return <div />
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  switch (input.modelSpace.screen.t) {
    case 'screen-main-menu': {
      return ScreenMainMenuFrontend.subscriptions(input)
    }
    case 'screen-pack-builder-open': {
      return ScreenPackBuilderOpenFrontend.subscriptions(input)
    }
    case 'screen-puzzle-builder': {
      return ScreenPuzzleBuilderFrontend.subscriptions(input)
    }
    case 'screen-puzzle-builder-open': {
      return ScreenPuzzleBuilderOpenFrontend.subscriptions(input)
    }
    case 'screen-pack-builder': {
      if (!input.modelSpace.screenPackBuilder) {
        return Sub.None
      }
      return Sub.tag(
        'got-screen-pack-builder-msg',
        ScreenPackBuilderFrontend.subscriptions({ ...input, modelSpace: input.modelSpace.screenPackBuilder }),
      )
    }
  }
}

export const BuildFrontend = {
  init: initFrontend,
  update,
  subscriptions,
  View,
  ViewFeedItem,
}
