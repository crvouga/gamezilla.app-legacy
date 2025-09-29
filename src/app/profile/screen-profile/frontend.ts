import { TranslatedText } from '~/@/l18n'
import { isAnyMsg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { Gutter } from '~/@/ui/gutter'
import { IconUserPen } from '~/@/ui/icon'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { sx } from '~/@/vdom/style/sx'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ProfileFrontendCtx } from '../@/frontend/ctx'
import { ProfileLoaderFrontend } from '../@/user-profile-loader/frontend'

export type ModelFrontend = {}

const toUserId = (ctx: ProfileFrontendCtx): UserId | null => {
  const currentScreen = ctx.currentScreen
  if (currentScreen.t === 'profile') {
    return currentScreen.userId
  }
  return null
}

export const init = (_: {}): { model: ModelFrontend } => {
  return {
    model: {},
  }
}

export type Msg = { t: 'profiles_screenProfile_gotMsgOut'; c: unknown }

const isMsg = (msg: unknown): msg is Msg => {
  return isAnyMsg(msg) && msg.t.startsWith('profiles_screenProfile_')
}

export const update = <T extends ModelFrontend>(input: {
  model: T
  msg?: unknown
}): {
  model: T
  msgOut?: unknown[]
} => {
  if (!isMsg(input.msg)) return { model: input.model }
  switch (input.msg?.t) {
    case 'profiles_screenProfile_gotMsgOut': {
      return { model: input.model, msgOut: [input.msg.c] }
    }
  }
}

export const subscriptions = (input: { ctx: ProfileFrontendCtx; model: ModelFrontend }): Sub<Msg> => {
  const userId = toUserId(input.ctx)
  if (!userId) return Sub.none()
  return ProfileLoaderFrontend.watch(
    input.ctx,
    {
      order: { createdAt: 'asc' },
      pagination: { limit: 1, offset: 0 },
      whereAnd: { userId: { equals: userId } },
    },
    (c): Msg => ({ t: 'profiles_screenProfile_gotMsgOut', c: ProfileLoaderFrontend.gotMsg(c) }),
  )
}

export const View = (input: { ctx: ProfileFrontendCtx; model: ModelFrontend; dispatch: (msg: Msg) => void }) => {
  return h(ScreenLayout, {
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    id: 'profile-screen',
    renderBody: () => h(ViewBody, input),
  })
}

const ViewBody = (input: { ctx: ProfileFrontendCtx; model: ModelFrontend; dispatch: (msg: Msg) => void }) => {
  const userId = toUserId(input.ctx)

  if (!userId) return null

  const profile = input.ctx.profilesByUserId[userId]

  const isCurrentUserProfile = input.ctx.currentUser?.userId === userId

  return h(Box, { style: sx({ flexDirection: 'col', width: 'full', alignItems: 'center', gap: 4, padding: 6 }) }, [
    h(Avatar, { style: sx({ size: 28 }), src: UserProfile.toAvatarUrl(profile), alt: 'profile avatar' }),
    h(Typography, {
      variant: 'title',
      text: profile ? input.ctx.t('username', profile.username) : TranslatedText.ellipsis,
    }),

    isCurrentUserProfile
      ? h(
          Box,
          {
            style: sx({
              flexDirection: 'row',
              width: 'full',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingTop: 4,
            }),
          },
          [
            h(Button, {
              onPress: () =>
                input.dispatch({
                  t: 'profiles_screenProfile_gotMsgOut',
                  c: PushScreenCmd.init({ t: 'profile-edit', n: 'profile' }),
                }),
              style: sx({ maxWidth: 64, flex: 1 }),
              renderIconStart: (iconInput) => h(IconUserPen, iconInput),
              text: input.ctx.t('profile.edit-profile'),
              size: 'sm',
              width: 'full',
            }),
          ],
        )
      : null,

    h(Gutter, { variant: 'screen' }),
  ])
}
