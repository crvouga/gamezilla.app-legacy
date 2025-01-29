import { Avatar, Button, IconArrowLeftOnRect, IconUserPen, SpinnerBlock, Typography } from '~/@/ui'
import { Gutter } from '~/@/ui/gutter'
import type { UserId } from '~/app/@/data/user-id'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import type { FrontendCtx, ModelFrontend, MsgFrontend } from '../types'

const View = (input: {
  ctx: FrontendCtx
  userId: UserId
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
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
  const profile = input.model.profiles[input.userId]
  if (!profile) return <SpinnerBlock />
  const isCurrentUserProfile = profile.userId === input.ctx.currentUserId
  return (
    <div className='flex w-full flex-col items-center gap-4 p-6'>
      <Avatar className='size-28' src={profile.avatarUrl} alt='profile avatar' />
      <Typography variant='title' text={input.ctx.t('username', profile.username)} />
      {isCurrentUserProfile && (
        <div className='flex w-full items-center justify-center gap-6 pt-4'>
          <Button
            onClick={() => input.dispatch({ t: 'clicked-edit-profile-button' })}
            className='max-w-64 flex-1'
            iconStart={(iconInput) => <IconUserPen {...iconInput} />}
            text={input.ctx.t('profile.edit-profile')}
            size='sm'
          />
          <Button
            onClick={() => input.dispatch({ t: 'clicked-logout-button' })}
            className='max-w-64 flex-1'
            iconStart={(iconInput) => <IconArrowLeftOnRect {...iconInput} />}
            text={input.ctx.t('auth.logout')}
            size='sm'
          />
        </div>
      )}

      <Gutter variant='screen' />
    </div>
  )
}

export const ProfileScreen = {
  View,
}
