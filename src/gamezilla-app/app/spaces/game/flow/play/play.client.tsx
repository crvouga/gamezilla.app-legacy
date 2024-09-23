import { Sub } from 'gamezilla-app/@/core'
import { GameClientModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import type { ClientModule } from './play.types'
import { ScreenPuzzleClient } from './screen-play-puzzle/screen-play-puzzle.client'
import { ScreenSelectPackClient } from './screen-select-pack/screen-select-pack.client'
import { ScreenSelectPuzzleClient } from './screen-select-puzzle/select-puzzle.client'

const init: ClientModule['init'] = {}

const update: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => ScreenPuzzleClient.update({ ...input, model }),
    (model) => ScreenSelectPackClient.update({ ...input, model }),
    (model) => ScreenSelectPuzzleClient.update({ ...input, model })
  )
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

const ViewScreen: ClientModule['View'] = (input) => {
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
