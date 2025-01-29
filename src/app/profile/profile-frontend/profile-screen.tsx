import { Avatar, Button, IconArrowLeftOnRect, IconUserPen, SpinnerBlock, Typography } from '~/@/ui'
import { Gutter } from '~/@/ui/gutter'
import { Profile } from '~/app/@/data/profile'
import type { UserId } from '~/app/@/data/user-id'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ScreenBodyRoot } from '~/app/@/ui/screen/layout/screen-body-root'
import type { FrontendCtx, ModelFrontend, MsgFrontend } from '../types'

const View = (input: {
  ctx: FrontendCtx
  userId: UserId
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
  const profile = input.model.profiles[input.userId]

  if (!profile) return <ViewLoading ctx={input.ctx} />

  const isCurrentUserProfile = profile?.userId === input.ctx.currentUserId

  if (isCurrentUserProfile) return <ViewOwnProfile {...input} profile={profile} />

  return <ViewProfile {...input} isCurrentUserProfile={isCurrentUserProfile} profile={profile} />
}

const ViewLoading = (input: { ctx: FrontendCtx }) => {
  return (
    <ScreenLayout
      isTopLevel
      ctx={input.ctx}
      parentScreen={input.ctx.parentScreen}
      id='profile-screen'
      renderBody={() => <SpinnerBlock />}
    />
  )
}

const ViewOwnProfile = (input: { ctx: FrontendCtx; profile: Profile; dispatch: (msg: MsgFrontend) => void }) => {
  return (
    <ScreenLayout
      isTopLevel
      ctx={input.ctx}
      parentScreen={input.ctx.parentScreen}
      navBar={{ title: input.ctx.t('username', input.profile.username) }}
      id='profile-screen'
      renderBody={() => (
        <ScreenBodyRoot className='gap-4 p-6'>
          <Avatar className='size-28' src={input.profile?.avatarUrl} alt='profile avatar' />
          <Button
            onClick={() => input.dispatch({ t: 'clicked-edit-profile-button' })}
            className='w-full'
            iconStart={(iconInput) => <IconUserPen {...iconInput} />}
            text={input.ctx.t('profile.update-profile')}
          />
          <Button
            onClick={() => input.dispatch({ t: 'clicked-logout-button' })}
            className='w-full'
            iconStart={(iconInput) => <IconArrowLeftOnRect {...iconInput} />}
            text={input.ctx.t('auth.logout')}
          />
          <Gutter variant='screen' />
        </ScreenBodyRoot>
      )}
    />
  )
}

const ViewProfile = (input: {
  ctx: FrontendCtx
  isCurrentUserProfile: boolean
  profile: Profile
  dispatch: (msg: MsgFrontend) => void
}) => {
  return (
    <ScreenLayout
      isTopLevel
      ctx={input.ctx}
      parentScreen={input.ctx.parentScreen}
      navBar={{ title: input.ctx.t('username', input.profile.username) }}
      id='profile-screen'
      renderBody={() => (
        <ScreenBodyRoot className='gap-4 p-6'>
          <Avatar className='size-28' src={input.profile?.avatarUrl} alt='profile avatar' />
          <Typography variant='title' text={input.ctx.t('username', input.profile.username)} />
          <Button
            onClick={() => input.dispatch({ t: 'clicked-edit-profile-button' })}
            className='w-full'
            iconStart={(iconInput) => <IconUserPen {...iconInput} />}
            text={input.ctx.t('profile.update-profile')}
          />
          <Button
            onClick={() => input.dispatch({ t: 'clicked-logout-button' })}
            className='w-full'
            iconStart={(iconInput) => <IconArrowLeftOnRect {...iconInput} />}
            text={input.ctx.t('auth.logout')}
          />
          <Gutter variant='screen' />
        </ScreenBodyRoot>
      )}
    />
  )
}

export const ProfileScreen = {
  View,
}
