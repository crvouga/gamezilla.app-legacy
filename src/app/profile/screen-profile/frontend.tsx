import { TranslatedText } from '~/@/l18n'
import { Sub } from '~/@/sub'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { Gutter } from '~/@/ui/gutter'
import { IconArrowLeftOnRect } from '~/@/ui/icon/icon-arrow-left-on-rect'
import { IconUserPen } from '~/@/ui/icon/icon-user-pen'
import { Typography } from '~/@/ui/typography'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'

import { BackScreenCmd } from '~/app/@/frontend/back-screen-cmd'
import { LogoutCmd } from '~/app/@/frontend/logout-cmd'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ProfileFrontendCtx } from '../@/frontend/ctx'
import { ProfileLoaderFrontend } from '../@/user-profile-loader/frontend'
import { FrontendModule } from './types'

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
    case 'clicked-back-button': {
      return { model: input.model, msgOut: [BackScreenCmd.init()] }
    }
    case 'clicked-edit-profile-button': {
      return { model: input.model, msgOut: [PushScreenCmd.init({ t: 'profile-edit', n: 'profile' })] }
    }
    case 'clicked-logout-button': {
      return { model: input.model, msgOut: [LogoutCmd.init()] }
    }
    case 'got-msg-out': {
      return { model: input.model, msgOut: [input.msg.c] }
    }
  }
}
const subscriptions: FrontendModule['subscriptions'] = (input) => {
  const userId = toUserId(input.ctx)
  if (!userId) return Sub.None
  return ProfileLoaderFrontend.watch(
    input.ctx,
    {
      order: { createdAt: 'asc' },
      pagination: { limit: 1, offset: 0 },
      whereAnd: { userId: { equals: userId } },
    },
    (c) => ({ t: 'got-msg-out', c: ProfileLoaderFrontend.gotMsg(c) }),
  )
}

const View: FrontendModule['View'] = (input) => {
  return (
    <ScreenLayout
      ctx={input.ctx}
      parentScreen={input.ctx.parentScreen}
      id='profile-screen'
      renderBody={() => <ViewBody {...input} />}
    />
  )
}

const ViewBody: typeof View = (input) => {
  const userId = toUserId(input.ctx)

  if (!userId) return null

  const profile = input.ctx.profilesByUserId[userId]

  const isCurrentUserProfile = input.ctx.currentUserId === userId

  return (
    <div className='flex w-full flex-col items-center gap-4 p-6'>
      <Avatar className='size-28' src={UserProfile.toAvatarUrl(profile)} alt='profile avatar' />
      <Typography
        variant='title'
        text={profile ? input.ctx.t('username', profile.username) : TranslatedText.ellipsis}
      />
      {isCurrentUserProfile && (
        <div className='flex w-full items-center justify-center gap-6 pt-4'>
          <Button
            onClick={() => input.dispatch({ t: 'clicked-edit-profile-button' })}
            className='max-w-64 flex-1'
            renderIconStart={(iconInput) => <IconUserPen {...iconInput} />}
            text={input.ctx.t('profile.edit-profile')}
            size='sm'
          />
          <Button
            onClick={() => input.dispatch({ t: 'clicked-logout-button' })}
            className='max-w-64 flex-1'
            renderIconStart={(iconInput) => <IconArrowLeftOnRect {...iconInput} />}
            text={input.ctx.t('auth.logout')}
            size='sm'
          />
        </div>
      )}

      <Gutter variant='screen' />
    </div>
  )
}

export const ScreenProfileFrontend = {
  View,
  subscriptions,
  update,
  init,
}
