import { TranslatedText } from '~/@/l18n'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { Clickable } from '~/@/ui/clickable'
import { IconChevronRight } from '~/@/ui/icon'
import { sx } from '~/@/vdom/style/sx'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { UserProfile } from '~/app/@/data/user-profile'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { FrontendCtxModule } from '../screen-update-username/types'
import type { ModelFrontend, MsgFrontend } from '../types'

export const View = (input: { ctx: FrontendCtxModule; dispatch: (msg: MsgFrontend) => void; model: ModelFrontend }) => {
  if (!input.ctx.currentUser?.userId) return null

  const profile = input.ctx.profilesByUserId[input.ctx.currentUser?.userId]

  if (!profile) return null

  return h(ScreenLayout, {
    id: 'profile-edit',
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    navBar: {
      title: input.ctx.t('profile.edit-profile'),
      back: {
        // onPress: () => input.dispatch({ t: 'clicked-back-button', from: { t: 'profile-update' } }),
      },
    },
    renderBody: () =>
      h(Box, { style: sx({ flexDirection: 'col', width: 'full', flex: 1, alignItems: 'center', gap: 4 }) }, [
        h(
          Box,
          {
            style: sx({
              flexDirection: 'col',
              width: 'full',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }),
          },
          [
            h(Avatar, {
              src: UserProfile.toAvatarUrl(profile),
              style: sx({ size: 16 }),
              //   alt: input.ctx.t('avatar-title'),
              // onPress: () => input.dispatch({ t: 'clicked-avatar' }),
            }),
            h(Button, {
              size: 'sm',
              color: 'primary',
              variant: 'text',
              width: 'full',
              // onPress: () => input.dispatch({ t: 'clicked-change-avatar-button' }),
              text: input.ctx.t('profile.update-avatar'),
            }),
          ],
        ),

        h(ViewField, {
          // onPress: () => input.dispatch({ t: 'clicked-update-username-button' }),
          label: input.ctx.t('username.username-label'),
          value: input.ctx.t('username', profile.username),
        }),
      ]),
  })
}

const ViewField = (input: { label: TranslatedText; value: TranslatedText; onPress?: () => void }) => {
  return h(
    Clickable,
    {
      onPress: input.onPress,
      style: sx({
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 4,
      }),
    },
    [
      h(Box, { style: sx({ flexDirection: 'col', flex: 1, alignItems: 'flex-start' }) }, [
        h(Typography, { variant: 'label', text: input.label }),
        input.value && h(Typography, { variant: 'body', text: input.value }),
      ]),

      h(IconChevronRight, { style: sx({ size: 6 }) }),
    ],
  )
}

export const UpdateProfileScreen = {
  View,
}
