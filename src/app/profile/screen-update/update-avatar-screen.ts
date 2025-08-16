import { Avatar } from '~/@/ui/avatar'
import { TextField } from '~/@/ui/text-field'
import { sx } from '~/@/vdom/style/sx'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { AppFrontendCtx, AppFrontendCtxBase } from '~/app/@/frontend/ctx'
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
      h(Box, { style: sx({ flexDirection: 'col', width: 'full', flex: 1, gap: 8, padding: 4 }) }, [
        h(Avatar, { src: undefined, style: sx({ size: 28 }) }),
        h(Box, { style: sx({ flexDirection: 'col', width: 'full', gap: 4 }) }, [
          h(TextField, {
            label: input.ctx.t('profile-avatar.seed'),
            // value: input.model.draft?.avatarSeed ?? '',
            value: '',
            onChangeText: () => {},
            id: 'seed',
          }),
        ]),
      ]),
  })
}

export const UpdateAvatarScreen = {
  View,
}
