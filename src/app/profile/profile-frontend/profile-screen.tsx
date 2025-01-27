import { Profile } from '~/app/@/data/profile'
import type { UserId } from '~/app/@/data/user-id'
import { Avatar, Button, IconArrowLeftOnRect, IconUserPen, SpinnerBlock, Typography } from '~/@/ui'
import { Gutter } from '~/@/ui/gutter'
import { ScreenActionsProps, ScreenLayout } from '~/app/@/ui/screen-layout'
import type { FrontendCtx, ModelFrontend, MsgFrontend } from '../types'

const View = (input: {
  ctx: FrontendCtx
  userId: UserId
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
  const profile = input.model.profiles[input.userId]

  if (!profile) {
    return <ViewLoading ctx={input.ctx} parentActions={input.ctx.parentScreenActions} />
  }

  if (profile?.userId === input.ctx.currentUserId) {
    return <ViewOwnProfile ctx={input.ctx} profile={profile} dispatch={input.dispatch} />
  }

  return <ViewOtherProfile ctx={input.ctx} profile={profile} dispatch={input.dispatch} />
}

const ViewLoading = (input: { ctx: FrontendCtx; parentActions?: ScreenActionsProps | null }) => {
  return (
    <ScreenLayout ctx={input.ctx} parentActions={input.parentActions} id='profile-screen' main={<SpinnerBlock />} />
  )
}

const ViewOwnProfile = (input: { ctx: FrontendCtx; profile: Profile; dispatch: (msg: MsgFrontend) => void }) => {
  return (
    <ScreenLayout
      ctx={input.ctx}
      parentActions={input.ctx.parentScreenActions}
      topBar={{
        title: input.ctx.t('username', input.profile.username),
      }}
      id='profile-screen'
      main={
        <div className='flex flex-1 shrink-0 flex-col items-center justify-start gap-4 overflow-x-hidden overflow-y-scroll p-4'>
          <Avatar className='h-28 w-28' src={input.profile?.avatarUrl} alt='profile avatar' />
          <Button
            onClick={() =>
              input.dispatch({
                t: 'clicked-edit-profile-button',
              })
            }
            className='w-full'
            iconStart={(iconInput) => <IconUserPen {...iconInput} />}
            text={input.ctx.t('profile.update-profile')}
          />
          <Button
            onClick={() =>
              input.dispatch({
                t: 'clicked-logout-button',
              })
            }
            className='w-full'
            iconStart={(iconInput) => <IconArrowLeftOnRect {...iconInput} />}
            text={input.ctx.t('auth.logout')}
          />
          <Gutter variant='screen' />
        </div>
      }
    />
  )
}

const ViewOtherProfile = (input: { ctx: FrontendCtx; profile: Profile; dispatch: (msg: MsgFrontend) => void }) => {
  return (
    <ScreenLayout
      ctx={input.ctx}
      id='profile-screen'
      parentActions={input.ctx.parentScreenActions}
      topBar={{
        title: input.ctx.t('username', input.profile.username),
        onBack: () =>
          input.dispatch({
            t: 'clicked-back-button',
            from: {
              t: 'profile',
              userId: input.profile?.userId,
            },
          }),
      }}
      main={
        <div className='flex flex-col items-center justify-center gap-4 overflow-x-hidden p-4'>
          <Avatar className='h-28 w-28' src={input.profile?.avatarUrl} alt='profile avatar' />
          <Typography variant='title' text={input.ctx.t('username', input.profile.username)} />
        </div>
      }
    />
  )
}

export const ProfileScreen = {
  View,
}
