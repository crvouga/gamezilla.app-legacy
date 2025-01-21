import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { IconGamepad, TopBar } from '~/app/@/ui'
import { LayoutGameCoverArtHeader } from '../../../@/ui/layout-game-cover-art-header'
import { ViewUsersInSpaceList } from '../../../@/ui/users-in-space-list'
import { PacksDbQuery } from '../../@/pack/pack-db/query'
import { PackListFrontend } from '../../@/pack/pack-list/frontend'
import type { FrontendModule } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-clicked-open-pack-list-item': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navForwardMin)] }
    }
    case 'user-clicked-exit-play-mode-button': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }
    }
  }
  switch (input.msg?.t) {
    case 'screen-open-pack.got-pack-list-msg': {
      return { model: input.model, msgCmd: [PackListFrontend.gotMsg(input.msg.c)] }
    }
  }
  return {
    model: input.model,
  }
}

const toQuery = (input: { ctx: { currentUserId: UserId } }): PacksDbQuery => {
  return {
    order: {
      lastUpdatedAt: 'desc',
    },
    pagination: {
      limit: 25,
      offset: 0,
    },
    where: {
      createdBy: {
        equals: input.ctx.currentUserId,
      },
    },
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return PackListFrontend.watch(input.ctx, toQuery(input), (c) => ({ t: 'screen-open-pack.got-pack-list-msg', c }))
}

const View: FrontendModule['View'] = (input) => {
  if (input.ctx.currentUserId !== input.ctx.space.hostId) {
    return (
      <LayoutGameCoverArtHeader
        ctx={input.ctx}
        onBack={false}
        title={input.ctx.t('flow.play')}
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
              input.dispatch({
                t: 'game-main-menu.clicked-open-user-details-button',
                userId,
              })
            }
            ctx={input.ctx}
          />
        )}
      />
    )
  }

  const query = toQuery(input)

  return (
    <div className='flex h-full w-full flex-1 flex-col'>
      <TopBar
        ctx={input.ctx}
        onBack={() =>
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'user-clicked-exit-play-mode-button', userId: input.ctx.currentUserId },
          })
        }
        title={input.ctx.t('flow.select-a-pack')}
      />
      <PackListFrontend.View
        ctx={input.ctx}
        model={input.ctx.packList}
        query={query}
        onQueryChanged={(query) => {
          console.log('query', query)
        }}
        onClick={(pack) => input.dispatch({ t: 'got-msg-space', c: { t: 'user-clicked-open-pack-list-item', pack } })}
      />
    </div>
  )
}

export const ScreenOpenPackFrontend = {
  update,
  subscriptions,
  View,
}
