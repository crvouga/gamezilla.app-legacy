import { TranslatedText } from '~/@/l18n'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { IconChevronRight } from '~/@/ui/icon'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'
import { UserProfile } from '~/app/@/data/user-profile'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { FrontendCtxModule } from '../screen-update-username/types'
import type { ModelFrontend, MsgFrontend } from '../types'

export const View = (input: { ctx: FrontendCtxModule; dispatch: (msg: MsgFrontend) => void; model: ModelFrontend }) => {
  if (!input.ctx.currentUser?.userId) return null

  const profile = input.ctx.profilesByUserId[input.ctx.currentUser?.userId]

  if (!profile) return null

  return v(ScreenLayout, {
    id: 'profile-edit',
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    navBar: {
      title: input.ctx.t('profile.edit-profile'),
      back: {
        // onClick: () => input.dispatch({ t: 'clicked-back-button', from: { t: 'profile-update' } }),
      },
    },
    renderBody: () =>
      v('div', { class: 'flex w-full flex-1 flex-col items-center gap-4' }, [
        v('div', { class: 'flex w-full flex-col items-center justify-center gap-2' }, [
          v(Avatar, {
            src: UserProfile.toAvatarUrl(profile),
            class: 'size-16',
            //   alt: input.ctx.t('avatar-title'),
            // onClick: () => input.dispatch({ t: 'clicked-avatar' }),
          }),
          v(Button, {
            size: 'sm',
            color: 'primary',
            variant: 'text',
            class: 'block',
            // onClick: () => input.dispatch({ t: 'clicked-change-avatar-button' }),
            text: input.ctx.t('profile.update-avatar'),
          }),
        ]),

        v(ViewField, {
          // onClick: () => input.dispatch({ t: 'clicked-update-username-button' }),
          label: input.ctx.t('username.username-label'),
          value: input.ctx.t('username', profile.username),
        }),
      ]),
  })
}

const ViewField = (input: { label: TranslatedText; value: TranslatedText; onClick?: () => void }) => {
  return v('button', { onClick: input.onClick, class: 'flex w-full items-center justify-start px-4 py-2' }, [
    v('div', { class: 'flex flex-1 flex-col items-start' }, [
      v(Typography, { variant: 'label', text: input.label }),
      input.value && v(Typography, { variant: 'body', text: input.value }),
    ]),

    v(IconChevronRight, { class: 'size-6' }),
  ])
}

export const UpdateProfileScreen = {
  View,
}
