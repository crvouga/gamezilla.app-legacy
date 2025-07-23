import { IconGamepad } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { UserAccount } from '~/app/@/data/user-account'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ScreenLayoutHostSettingUpGame } from '../../../@/ui/screen-layout-host-setting-up-game/screen-layout-host-setting-up-game'
import { PackDbQueryCache } from '../../@/pack/pack-db-query-cache'
import { PackQuery } from '../../@/pack/pack-db/interface-query'
import { PackList } from '../../@/pack/pack-list/pack-list'
import type { FrontendModule } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-clicked-open-pack-puzzle-grid-item': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)] }
    }
    case 'user-clicked-exit-play-mode-button': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] }
    }
  }

  return {
    model: input.model,
  }
}

const toQuery = (_input: { ctx: { currentUser: UserAccount } }): PackQuery => {
  return {
    order: {
      lastUpdatedAt: 'desc',
    },
    pagination: {
      limit: 25,
      offset: 0,
    },
    where: {
      isOfficial: {
        equals: true,
      },
    },
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return PackDbQueryCache.sub(input.ctx.packDb, toQuery(input), (c) => ({ t: 'got-msg-out', c }))
}

const View: FrontendModule['View'] = (input) => {
  const isCurrentUserSpectating = input.ctx.currentUser.userId !== input.ctx.space.hostId
  if (isCurrentUserSpectating) {
    return h(ScreenLayoutHostSettingUpGame, {
      parentScreen: input.ctx.parentScreen,
      ctx: input.ctx,
      renderCoverArt: (props) => h(IconGamepad, props),
    })
  }

  const query = toQuery(input)

  return h(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    ctx: input.ctx,
    dataTestId: 'numberlink/open-pack-screen',
    id: 'screen-open-pack',
    navBar: {
      title: input.ctx.t('game.numberlink.select-a-pack'),
      back: {
        onPressDown: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'user-clicked-exit-play-mode-button', userId: input.ctx.currentUser.userId },
          }),
      },
    },
    renderBody: () =>
      h(PackList.View, {
        ctx: input.ctx,
        query: query,
        onQueryChanged: (query) => {
          console.log('query', query)
        },
        onPressDown: (pack) =>
          input.dispatch({
            t: 'got-msg-space',
            c: { userId: input.ctx.currentUser.userId, t: 'user-clicked-open-pack-puzzle-grid-item', pack },
          }),
      }),
  })
}

export const ScreenOpenPackFrontend = {
  update,
  subscriptions,
  View,
}
