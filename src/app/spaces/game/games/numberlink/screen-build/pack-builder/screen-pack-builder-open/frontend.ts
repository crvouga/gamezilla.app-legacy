import { v } from '~/@/vdom/v'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { PackLoaderFrontend } from '../../../@/pack/pack-loader/frontend'
import { GotPackLoaderMsg } from '../../../@/pack/pack-loader/got-pack-loader-msg.$msg'
import type { FrontendModule, MsgFrontend } from '../../types'
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
  const query = toQuery({ currentUserId: input.ctx.currentUser.userId, offset: 0 })
  return PackLoaderFrontend.watch(
    input.ctx,
    query,
    (c): MsgFrontend => ({ t: 'got-msg-out', c: GotPackLoaderMsg.init(c) }),
  )
}

const View: FrontendModule['View'] = (input) => {
  const query = toQuery({ currentUserId: input.ctx.currentUser.userId, offset: 0 })
  return v(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    id: 'screen-pack-builder-open',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('game.numberlink.pack-builder'),
      back: {
        onClick: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'user-clicked-back-button', userId: input.ctx.currentUser.userId },
          }),
      },
    },
    postAction: PackCreateNewFrontend.viewCreateAction(input),
    renderBody: () =>
      v(PackLoaderFrontend.ViewList, {
        ...input,
        model: input.ctx.packLoader,
        query: query,
        onQueryChanged: (query) => {
          console.log('query changed', query)
        },
        onClick: (pack) =>
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
