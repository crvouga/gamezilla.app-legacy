import { Sub } from '~/@/sub'
import { APP_SOUND, playSound } from '~/app/@/client/cmd'
import { GameClientModule } from '~/app/spaces/games/@/architecture/game-client-v2'
import { ScreenMainMenuClient } from './screen-main-menu/client'
import { ScreenPackBuilderOpenClient } from './screen-pack-builder-open/client'
import { ScreenPackBuilderClient } from './screen-pack-builder/client'
import { ScreenPuzzleBuilderOpenClient } from './screen-puzzle-builder-open/client'
import { ScreenPuzzleBuilderClient } from './screen-puzzle-builder/client'
import { initClient, type ClientModule } from './types'

const update: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => ScreenPackBuilderOpenClient.update({ ...input, model }),
    (model) => ScreenPackBuilderClient.update({ ...input, model }),
    (model) => ScreenPuzzleBuilderClient.update({ ...input, model }),
    (model) => ScreenPuzzleBuilderOpenClient.update({ ...input, model }),
    (model) => ScreenMainMenuClient.update({ ...input, model }),
    (model) => updateGotMsgCore({ ...input, model }),
    (model) => updateBackButton({ ...input, model })
  )
}

const updateBackButton: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'user-clicked-back-button': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)]
      }
    }
    default: {
      return {
        model: input.model
      }
    }
  }
}

const updateGotMsgCore: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-core': {
      return {
        model: input.model,
        msgCore: [input.msg.c]
      }
    }
    default: {
      return {
        model: input.model
      }
    }
  }
}

const View: ClientModule['View'] = (input) => {
  switch (input.modelCore.screen.t) {
    case 'screen-main-menu': {
      return <ScreenMainMenuClient.View {...input} />
    }

    case 'screen-puzzle-builder': {
      return <ScreenPuzzleBuilderClient.View {...input} />
    }

    case 'screen-pack-builder': {
      return <ScreenPackBuilderClient.View {...input} />
    }

    case 'screen-pack-builder-open': {
      return <ScreenPackBuilderOpenClient.View {...input} />
    }

    case 'screen-puzzle-builder-open': {
      return <ScreenPuzzleBuilderOpenClient.View {...input} />
    }
  }
}

const ViewFeedItem: ClientModule['ViewFeedItem'] = () => {
  return <div />
}

const subscriptions: ClientModule['subscriptions'] = (input) => {
  return Sub.batch([ScreenPuzzleBuilderOpenClient.subscriptions(input)])
}

export const BuilderClient: ClientModule = {
  init: initClient,
  update,
  subscriptions,
  View,
  ViewFeedItem
}
