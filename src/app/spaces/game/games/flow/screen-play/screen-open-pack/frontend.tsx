import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { IconGamepad } from '~/@/ui'
import { ScreenLayout } from '~/app/@/screen/screen-layout'
import { LayoutGameCoverArtHeader } from '../../../@/ui/layout-game-cover-art-header'
import { ViewUsersInSpaceList } from '../../../@/ui/users-in-space-list'
import { PackDbQueryFrontend } from '../../@/pack/pack-db-query/frontend'
import { PacksDbQuery } from '../../@/pack/pack-db/query'
import type { FrontendModule } from '../types'

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
  return PackDbQueryFrontend.watch(input.ctx, toQuery(input), (c) => ({ t: 'got-pack-db-query-msg', c }))
}

const View: FrontendModule['View'] = (input) => {
  if (input.ctx.currentUserId !== input.ctx.space.hostId) {
    return (
      <LayoutGameCoverArtHeader
        ctx={input.ctx}
        topBar={{ title: input.ctx.t('flow.play') }}
        renderCoverArt={(input) => (
          <div {...input}>
            <div className='h-full w-full p-4'>
              <IconGamepad className='h-full w-full' />
            </div>
          </div>
        )}
        renderContent={() => (
          <ViewUsersInSpaceList
            onOpenUserDetails={(userId) =>
              input.dispatch({ t: 'game-main-menu.clicked-open-user-details-button', userId })
            }
            ctx={input.ctx}
          />
        )}
      />
    )
  }

  const query = toQuery(input)

  return (
    <ScreenLayout
      ctx={input.ctx}
      id='screen-open-pack'
      topBar={{
        title: input.ctx.t('flow.select-a-pack'),
        onBack: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'user-clicked-exit-play-mode-button', userId: input.ctx.currentUserId },
          }),
      }}
      main={
        <PackDbQueryFrontend.ViewList
          ctx={input.ctx}
          model={input.ctx.packDbQuery}
          query={query}
          onQueryChanged={(query) => {
            console.log('query', query)
          }}
          onClick={(pack) =>
            input.dispatch({
              t: 'got-msg-space',
              c: { userId: input.ctx.currentUserId, t: 'user-clicked-open-pack-puzzle-grid-item', pack },
            })
          }
        />
      }
    />
  )
}

export const ScreenOpenPackFrontend = {
  update,
  subscriptions,
  View,
}
