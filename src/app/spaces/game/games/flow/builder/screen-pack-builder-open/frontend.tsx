import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { TopBar } from '~/app/@/ui'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { PackDbQueryFrontend } from '../../@/pack/pack-db-query/frontend'
import type { FrontendModule } from '../types'
import { PackCreateNewFrontend } from './create-new-pack/frontend'

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
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }
  }

  switch (input.msg?.t) {
    case 'screen-pack-builder-open.got-pack-db-query-msg': {
      return {
        model: input.model,
        msgCmd: [PackDbQueryFrontend.gotMsg(input.msg.c)],
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
  return PackDbQueryFrontend.watch(input.ctx, toQuery({ currentUserId: input.ctx.currentUserId, offset: 0 }), (c) => ({
    t: 'screen-pack-builder-open.got-pack-db-query-msg',
    c,
  }))
}

const View: FrontendModule['View'] = (input) => {
  const query = toQuery({
    currentUserId: input.ctx.currentUserId,
    offset: 0,
  })
  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden'>
      <TopBar
        onBack={() =>
          input.dispatch({ t: 'got-msg-space', c: { t: 'user-clicked-back-button', userId: input.ctx.currentUserId } })
        }
        ctx={input.ctx}
        title={input.ctx.t('flow.pack-builder')}
      />
      <PackDbQueryFrontend.View
        {...input}
        model={input.ctx.packDbQuery}
        query={query}
        fab={<PackCreateNewFrontend.ViewCreateFab {...input} />}
        onQueryChanged={(query) => {
          console.log('query changed', query)
        }}
        onClick={(pack) =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder-open.user-clicked-pack-item',
              pack,
              userId: input.ctx.currentUserId,
            },
          })
        }
      />
    </div>
  )
}

export const ScreenPackBuilderOpenFrontend = {
  View,
  update,
  subscriptions,
}
