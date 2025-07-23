import { Avatar } from '~/@/ui/avatar'
import { Box } from '~/@/vdom/primitives/box'
import { TextField } from '~/@/ui/text-field'
import { h } from '~/@/vdom/h'
import { AppFrontendCtxBase, AppFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import type { ModelFrontend, MsgFrontend } from '../types'

const View = (input: {
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
  ctx: AppFrontendCtxBase | AppFrontendCtx
}) => {
  return h(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    id: 'profile-update-avatar',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('profile.update-avatar'),
      back: {
        // onPress: () => input.dispatch({ t: 'clicked-back-button', from: { t: 'profile-avatar' } }),
      },
    },
    renderBody: () =>
      h(Box, { class: 'flex w-full flex-1 flex-col gap-8 p-4' }, [
        h(Avatar, { src: undefined, class: 'mx-auto size-28' }),
        h(Box, { class: 'flex w-full flex-col gap-4' }, [
          h(TextField, {
            label: input.ctx.t('profile-avatar.seed'),
            // value: input.model.draft?.avatarSeed ?? '',
            value: '',
            onChange: () => {},
            id: 'seed',
          }),
        ]),
      ]),
  })
}

export const UpdateAvatarScreen = {
  View,
}
