import { Sub } from '~/@/sub'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import type { FrontendModule } from './types'
import { ScreenPuzzleFrontend } from './screen-play-puzzle/frontend'
import { ScreenSelectPackFrontend } from './screen-select-pack/frontend'
import { ScreenSelectPuzzleFrontend } from './screen-select-puzzle/frontend'
import { GameMainMenu } from '../../@/ui/game-main-menu'

const init: FrontendModule['init'] = null

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => ScreenPuzzleFrontend.update({ ...input, model }),
    (model) => ScreenSelectPackFrontend.update({ ...input, model }),
    (model) => ScreenSelectPuzzleFrontend.update({ ...input, model }),
    (model) => updateGotMsgCore({ ...input, model }),
    (model) => GameMainMenu.update({ ...input, model }),
  )
}

const updateGotMsgCore: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-core': {
      return {
        model: input.model,
        msgCore: [input.msg.c],
      }
    }
  }

  return { model: input.model }
}

const subscriptions: FrontendModule['subscriptions'] = (_input) => {
  return Sub.None
}

const View: FrontendModule['View'] = (input) => {
  return (
    <div className='flex h-full w-full flex-col'>
      <ViewScreen {...input} />
    </div>
  )
}

const ViewScreen: typeof View = (input) => {
  switch (input.modelCore.screen.t) {
    case 'screen-select-puzzle': {
      return <ScreenSelectPuzzleFrontend.View {...input} />
    }

    case 'screen-select-pack': {
      return <ScreenSelectPackFrontend.View {...input} />
    }

    case 'screen-play-puzzle': {
      return <ScreenPuzzleFrontend.View {...input} />
    }

    default: {
      return null
    }
  }
}

const ViewFeedItem: FrontendModule['ViewFeedItem'] = (_input) => {
  return null
}

export const PlayFrontend = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
}
