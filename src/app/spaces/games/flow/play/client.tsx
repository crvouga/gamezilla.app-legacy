import { Sub } from '~/@/core'
import { GameClientModule } from '~/app/spaces/games/@/architecture/game-client-v2'
import type { ClientModule } from './types'
import { ScreenPuzzleClient } from './screen-play-puzzle/client'
import { ScreenSelectPackClient } from './screen-select-pack/client'
import { ScreenSelectPuzzleClient } from './screen-select-puzzle/client'
import { GameMainMenu } from '../../@/game/game-main-menu'

const init: ClientModule['init'] = null

const update: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => ScreenPuzzleClient.update({ ...input, model }),
    (model) => ScreenSelectPackClient.update({ ...input, model }),
    (model) => ScreenSelectPuzzleClient.update({ ...input, model }),
    (model) => updateGotMsgCore({ ...input, model }),
    (model) => GameMainMenu.update({ ...input, model })
  )
}

const updateGotMsgCore: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-core': {
      return {
        model: input.model,
        msgCore: [input.msg.c]
      }
    }
  }

  return { model: input.model }
}

const subscriptions: ClientModule['subscriptions'] = (_input) => {
  return Sub.None
}

const View: ClientModule['View'] = (input) => {
  return (
    <div className='flex h-full w-full flex-col'>
      <ViewScreen {...input} />
    </div>
  )
}

const ViewScreen: typeof View = (input) => {
  switch (input.modelCore.screen.t) {
    case 'screen-select-puzzle': {
      return <ScreenSelectPuzzleClient.View {...input} />
    }

    case 'screen-select-pack': {
      return <ScreenSelectPackClient.View {...input} />
    }

    case 'screen-play-puzzle': {
      return <ScreenPuzzleClient.View {...input} />
    }

    default: {
      return null
    }
  }
}

const ViewFeedItem: ClientModule['ViewFeedItem'] = (_input) => {
  return null
}

export const PlayClient = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem
}
