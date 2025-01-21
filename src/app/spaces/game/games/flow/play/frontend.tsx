import { Sub } from '~/@/sub'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import type { FrontendModule } from './types'
import { ScreenPuzzleFrontend } from './screen-play-puzzle/frontend'
import { ScreenOpenPackFrontend } from './screen-open-pack/frontend'
import { ScreenOpenPuzzleFrontend } from './screen-open-puzzle/frontend'
import { GameMainMenu } from '../../@/ui/game-main-menu'

const init: FrontendModule['init'] = null

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => ScreenPuzzleFrontend.update({ ...input, model }),
    (model) => ScreenOpenPackFrontend.update({ ...input, model }),
    (model) => ScreenOpenPuzzleFrontend.update({ ...input, model }),
    (model) => updateGotMsgSpace({ ...input, model }),
    (model) => GameMainMenu.update({ ...input, model }),
  )
}

const updateGotMsgSpace: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-space': {
      return {
        model: input.model,
        msgSpace: [input.msg.c],
      }
    }
  }

  return { model: input.model }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([ScreenOpenPackFrontend.subscriptions(input)])
}

const View: FrontendModule['View'] = (input) => {
  return (
    <div className='flex h-full w-full flex-col'>
      <ViewScreen {...input} />
    </div>
  )
}

const ViewScreen: typeof View = (input) => {
  switch (input.modelSpace.screen.t) {
    case 'screen-select-puzzle': {
      return <ScreenOpenPuzzleFrontend.View {...input} />
    }

    case 'screen-select-pack': {
      return <ScreenOpenPackFrontend.View {...input} />
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
