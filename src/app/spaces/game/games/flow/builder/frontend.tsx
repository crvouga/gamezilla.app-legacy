import { Sub } from '~/@/sub'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { ScreenMainMenuFrontend } from './screen-main-menu/frontend'
import { ScreenPackBuilderOpenFrontend } from './screen-pack-builder-open/frontend'
import { ScreenPackBuilderFrontend } from './screen-pack-builder/frontend'
import { ScreenPuzzleBuilderOpenFrontend } from './screen-puzzle-builder-open/frontend'
import { ScreenPuzzleBuilderFrontend } from './screen-puzzle-builder/frontend'
import { initFrontend, type FrontendModule } from './types'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => ScreenPackBuilderOpenFrontend.update({ ...input, model }),
    (model) => ScreenPackBuilderFrontend.update({ ...input, model }),
    (model) => ScreenPuzzleBuilderFrontend.update({ ...input, model }),
    (model) => ScreenPuzzleBuilderOpenFrontend.update({ ...input, model }),
    (model) => ScreenMainMenuFrontend.update({ ...input, model }),
    (model) => updateGotMsgSpace({ ...input, model }),
    (model) => updateBackButton({ ...input, model }),
  )
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

const updateGotMsgSpace: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-space': {
      return {
        model: input.model,
        msgSpace: [input.msg.c],
      }
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

    case 'screen-pack-builder': {
      return <ScreenPackBuilderFrontend.View {...input} />
    }

    case 'screen-pack-builder-open': {
      return <ScreenPackBuilderOpenFrontend.View {...input} />
    }

    case 'screen-puzzle-builder-open': {
      return <ScreenPuzzleBuilderOpenFrontend.View {...input} />
    }
  }
}

const ViewFeedItem: FrontendModule['ViewFeedItem'] = () => {
  return <div />
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([
    ScreenPuzzleBuilderOpenFrontend.subscriptions(input),
    ScreenPackBuilderOpenFrontend.subscriptions(input),
  ])
}

export const BuilderFrontend: FrontendModule = {
  init: initFrontend,
  update,
  subscriptions,
  View,
  ViewFeedItem,
}
