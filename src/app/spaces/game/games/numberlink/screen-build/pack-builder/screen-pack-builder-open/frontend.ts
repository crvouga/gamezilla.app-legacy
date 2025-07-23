import { h } from '~/@/vdom/h'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { PackDbQueryCache } from '../../../@/pack/pack-db-query-cache'
import { PackList } from '../../../@/pack/pack-list/pack-list'
import type { FrontendModule } from '../../types'
import { PackCreateNewFrontend } from './button-create-new-pack/frontend'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => updateMain({ ...input, model }),
    (model) => PackCreateNewFrontend.update({ ...input, model }),
  )
}

export const updateMain: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder-open.user-clicked-pack-item': {
      return {
        model: input.model,
        msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)],
      }
    }
  }

  return {
    model: input.model,
  }
}

const toQuery = (input: { currentUserId: UserId; offset: number }) => {
  return {
    pagination: {
      offset: input.offset,
      limit: input.offset + 25,
    },
    order: {
      lastUpdatedAt: 'asc',
    },
    where: {
      createdBy: {
        equals: input.currentUserId,
      },
    },
  } as const
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return PackDbQueryCache.sub(
    input.ctx.packDb,
    toQuery({ currentUserId: input.ctx.currentUser.userId, offset: 0 }),
    (c) => ({ t: 'got-msg-out', c }),
  )
}

export const TEST_ID_NUMBERLINK_PACK_BUILDER_OPEN_SCREEN = 'numberlink-pack-builder-open-screen'

const View: FrontendModule['View'] = (input) => {
  const query = toQuery({ currentUserId: input.ctx.currentUser.userId, offset: 0 })
  return h(ScreenLayout, {
    dataTestId: TEST_ID_NUMBERLINK_PACK_BUILDER_OPEN_SCREEN,
    parentScreen: input.ctx.parentScreen,
    id: 'screen-pack-builder-open',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('game.numberlink.pack-builder'),
      back: {
        onPressDown: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'user-clicked-back-button', userId: input.ctx.currentUser.userId },
          }),
      },
    },
    postAction: PackCreateNewFrontend.viewCreateAction(input),
    renderBody: () =>
      h(PackList.View, {
        ...input,
        query: query,
        onQueryChanged: (query) => {
          console.log('query changed', query)
        },
        onPressDown: (pack) =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder-open.user-clicked-pack-item',
              pack,
              userId: input.ctx.currentUser.userId,
            },
          }),
      }),
  })
}

export const ScreenPackBuilderOpenFrontend = {
  View,
  update,
  subscriptions,
}
