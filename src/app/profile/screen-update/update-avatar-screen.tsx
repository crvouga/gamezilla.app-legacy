import { Avatar } from '~/@/ui/avatar'
import { TextField } from '~/@/ui/text-field'
import { AnonymousFrontendCtx, AppFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import type { ModelFrontend, MsgFrontend } from '../types'

const View = (input: {
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
  ctx: AnonymousFrontendCtx | AppFrontendCtx
}) => {
  return (
    <ScreenLayout
      parentScreen={input.ctx.parentScreen}
      id='profile-update-avatar'
      ctx={input.ctx}
      navBar={{
        title: input.ctx.t('profile.update-avatar'),
        back: {
          // onClick: () => input.dispatch({ t: 'clicked-back-button', from: { t: 'profile-avatar' } }),
        },
      }}
      renderBody={() => (
        <div className='flex w-full flex-1 flex-col gap-8 p-4'>
          <Avatar src={undefined} className='mx-auto size-28' />

          <div className='flex w-full flex-col gap-4'>
            <TextField
              label={input.ctx.t('profile-avatar.seed')}
              // value={input.model.draft?.avatarSeed ?? ''}
              value=''
              onChange={() => {}}
              id='seed'
            />
          </div>
        </div>
      )}
    />
  )
}

export const UpdateAvatarScreen = {
  View,
}
