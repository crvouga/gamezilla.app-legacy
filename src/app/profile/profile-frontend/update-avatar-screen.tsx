import { ProfileAvatar } from '~/app/@/data/profile-avatar'
import { AnonymousFrontendCtx, AppFrontendCtx } from '~/app/@/frontend/ctx'
import { Avatar, TextField } from '~/@/ui'
import { ScreenLayout } from '~/app/@/ui/screen/layout'
import type { ModelFrontend, MsgFrontend } from '../types'

const View = (input: {
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
  ctx: AnonymousFrontendCtx | AppFrontendCtx
}) => {
  return (
    <ScreenLayout
      id='profile-update-avatar'
      ctx={input.ctx}
      nav={{
        title: input.ctx.t('profile.update-avatar'),
        onBack: () =>
          input.dispatch({
            t: 'clicked-back-button',
            from: {
              t: 'profile-avatar',
            },
          }),
      }}
      renderBody={() => (
        <div className='flex w-full flex-1 flex-col gap-8 p-4'>
          <Avatar
            src={
              input.model.draft?.avatarSeed && input.model.draft?.avatarStyle
                ? ProfileAvatar.toUrl({
                    seed: input.model.draft?.avatarSeed,
                    style: input.model.draft?.avatarStyle,
                  })
                : undefined
            }
            className='mx-auto size-28'
          />

          <div className='flex w-full flex-col gap-4'>
            <TextField
              label={input.ctx.t('profile-avatar.seed')}
              value={input.model.draft?.avatarSeed ?? ''}
              onChange={(val) =>
                input.dispatch({
                  t: 'inputted-avatar-seed',
                  seed: val,
                })
              }
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
