import { Eff } from '~/@/eff'
import { TranslatedText } from '~/@/l18n'
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
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { pushScreen } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ProfileFrontendCtx } from '../@/frontend/ctx'
import { ProfileLoaderFrontend } from '../@/user-profile-loader/frontend'

export type ModelFrontend = {
  noop: boolean
}

const toUserId = (ctx: ProfileFrontendCtx): UserId | null => {
  const currentScreen = ctx.currentScreen
  if (currentScreen.t === 'profile_profile') {
    return currentScreen.userId
  }
  return null
}

export const init = (_input: { ctx: ProfileFrontendCtx }): { model: ModelFrontend; eff?: Eff<Msg> } => {
  return {
    model: {
      noop: false,
    },
  }
}

export type Msg = { t: 'noop' } | { t: 'screenProfile_clickedEdit' }

export const update = (input: {
  ctx: ProfileFrontendCtx
  model: ModelFrontend
  msg: Msg
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'screenProfile_clickedEdit': {
      return {
        model: input.model,
        eff: pushScreen({ n: 'profile', t: 'profile_profileEdit' }, true),
      }
    }
    case 'noop': {
      return {
        model: input.model,
        eff: Eff.None,
      }
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
    (): Msg => ({ t: 'noop' }),
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
                  t: 'screenProfile_clickedEdit',
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
