import { TranslatedText } from '~/@/l18n'
import { Avatar, Button, IconChevronRight, Typography } from '~/@/ui'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import type { FrontendCtx, ModelFrontend, MsgFrontend } from '../types'

export const View = (input: { ctx: FrontendCtx; dispatch: (msg: MsgFrontend) => void; model: ModelFrontend }) => {
  if (!input.ctx.currentUser?.userId) return null

  const profile = input.ctx.profiles[input.ctx.currentUser?.userId]

  if (!profile) return null

  return (
    <ScreenLayout
      id='profile-edit'
      ctx={input.ctx}
      parentScreen={input.ctx.parentScreen}
      navBar={{
        title: input.ctx.t('profile.edit-profile'),
        onBack: () => input.dispatch({ t: 'clicked-back-button', from: { t: 'profile-update' } }),
      }}
      renderBody={() => (
        <div className='flex w-full flex-1 flex-col items-center gap-4'>
          <div className='flex w-full flex-col items-center justify-center gap-2'>
            <Avatar
              src={profile?.avatarUrl}
              className='size-16'
              //   alt={input.ctx.t('avatar-title')}
              onClick={() => input.dispatch({ t: 'clicked-avatar' })}
            />
            <Button
              size='sm'
              color='primary'
              variant='text'
              className='block'
              onClick={() => input.dispatch({ t: 'clicked-change-avatar-button' })}
              text={input.ctx.t('profile.update-avatar')}
            />
          </div>

          <ViewField
            onClick={() => input.dispatch({ t: 'clicked-update-username-button' })}
            label={input.ctx.t('username.username-label')}
            value={input.ctx.t('username', profile.username)}
          />
        </div>
      )}
    />
  )
}

const ViewField = (input: { label: TranslatedText; value: TranslatedText; onClick?: () => void }) => {
  return (
    <button onClick={input.onClick} className='flex w-full items-center justify-start px-4 py-2'>
      <div className='flex flex-1 flex-col items-start'>
        <Typography variant='label' text={input.label} />
        {input.value && <Typography variant='body' text={input.value} />}
      </div>

      <IconChevronRight className='size-6' />
    </button>
  )
}

export const UpdateProfileScreen = {
  View,
}
