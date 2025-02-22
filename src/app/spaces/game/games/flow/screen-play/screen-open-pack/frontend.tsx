import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ScreenLayoutHostSettingUpGame } from '../../../@/ui/screen-layout-host-setting-up-game/screen-layout-host-setting-up-game'
import { PackLoaderFrontend } from '../../@/pack/pack-loader/frontend'
import { PacksDbQuery } from '../../@/pack/pack-db/query'
import type { FrontendModule } from '../types'
import { IconGamepad } from '~/@/ui'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-clicked-open-pack-puzzle-grid-item': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navForwardMin)] }
    }
    case 'user-clicked-exit-play-mode-button': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }
    }
  }

  return {
    model: input.model,
  }
}

const toQuery = (_input: { ctx: { currentUserId: UserId } }): PacksDbQuery => {
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
  return PackLoaderFrontend.watch(input.ctx, toQuery(input), (c) => ({ t: 'got-pack-loader-msg', c }))
}

const View: FrontendModule['View'] = (input) => {
  const isCurrentUserSpectating = input.ctx.currentUser.userId !== input.ctx.space.hostId
  if (isCurrentUserSpectating) {
    return (
      <ScreenLayoutHostSettingUpGame
        parentScreen={input.ctx.parentScreen}
        ctx={input.ctx}
        renderCoverArt={(props) => <IconGamepad {...props} />}
      />
    )
  }

  const query = toQuery(input)

  return (
    <ScreenLayout
      parentScreen={input.ctx.parentScreen}
      ctx={input.ctx}
      id='screen-open-pack'
      navBar={{
        title: input.ctx.t('flow.select-a-pack'),
        onBack: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'user-clicked-exit-play-mode-button', userId: input.ctx.currentUser.userId },
          }),
      }}
      renderBody={() => (
        <PackLoaderFrontend.ViewList
          ctx={input.ctx}
          model={input.ctx.packLoader}
          query={query}
          onQueryChanged={(query) => {
            console.log('query', query)
          }}
          onClick={(pack) =>
            input.dispatch({
              t: 'got-msg-space',
              c: { userId: input.ctx.currentUser.userId, t: 'user-clicked-open-pack-puzzle-grid-item', pack },
            })
          }
        />
      )}
    />
  )
}

export const ScreenOpenPackFrontend = {
  update,
  subscriptions,
  View,
}
