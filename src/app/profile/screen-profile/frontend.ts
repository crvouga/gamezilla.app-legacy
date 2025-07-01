import { TranslatedText } from '~/@/l18n'
import { Sub } from '~/@/sub'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { Gutter } from '~/@/ui/gutter'
import { IconUserPen } from '~/@/ui/icon'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ProfileFrontendCtx } from '../@/frontend/ctx'
import { ProfileLoaderFrontend } from '../@/user-profile-loader/frontend'
import { FrontendModule, MsgFrontend } from './types'

const toUserId = (ctx: ProfileFrontendCtx): UserId | null => {
  const currentScreen = ctx.currentScreen
  if (currentScreen.t === 'profile') {
    return currentScreen.userId
  }
  return null
}

const init: FrontendModule['init'] = (_) => {
  return {
    model: {},
  }
}

const update: FrontendModule['update'] = (input) => {
  if (!input.msg) return { model: input.model }
  switch (input.msg.t) {
    case 'got-msg-out': {
      return { model: input.model, msgOut: [input.msg.c] }
    }
  }
}
const subscriptions: FrontendModule['subscriptions'] = (input) => {
  const userId = toUserId(input.ctx)
  if (!userId) return Sub.none()
  return ProfileLoaderFrontend.watch(
    input.ctx,
    {
      order: { createdAt: 'asc' },
      pagination: { limit: 1, offset: 0 },
      whereAnd: { userId: { equals: userId } },
    },
    (c): MsgFrontend => ({ t: 'got-msg-out', c: ProfileLoaderFrontend.gotMsg(c) }),
  )
}

const View: FrontendModule['View'] = (input) => {
  return v(ScreenLayout, {
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    id: 'profile-screen',
    renderBody: () => v(ViewBody, input),
  })
}

const ViewBody: typeof View = (input) => {
  const userId = toUserId(input.ctx)

  if (!userId) return null

  const profile = input.ctx.profilesByUserId[userId]

  const isCurrentUserProfile = input.ctx.currentUserId === userId

  return v('div', { className: 'flex w-full flex-col items-center gap-4 p-6' }, [
    v(Avatar, { className: 'size-28', src: UserProfile.toAvatarUrl(profile), alt: 'profile avatar' }),
    v(Typography, {
      variant: 'title',
      text: profile ? input.ctx.t('username', profile.username) : TranslatedText.ellipsis,
    }),

    isCurrentUserProfile
      ? v('div', { className: 'flex w-full items-center justify-center gap-6 pt-4' }, [
          v(Button, {
            onClick: () =>
              input.dispatch({ t: 'got-msg-out', c: PushScreenCmd.init({ t: 'profile-edit', n: 'profile' }) }),
            className: 'max-w-64 flex-1',
            renderIconStart: (iconInput) => v(IconUserPen, iconInput),
            text: input.ctx.t('profile.edit-profile'),
            size: 'sm',
          }),
        ])
      : null,

    v(Gutter, { variant: 'screen' }),
  ])
}

export const ScreenProfileFrontend = {
  View,
  subscriptions,
  update,
  init,
}
