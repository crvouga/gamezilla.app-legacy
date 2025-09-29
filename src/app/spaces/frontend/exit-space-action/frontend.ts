import { IconDoorOpen } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import type { SpaceFrontendModule } from '../space-frontend'

const update: SpaceFrontendModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'exit-space-action.clicked-exit-space-button': {
      return {
        model,
        msgOut: [PushScreenCmd.init({ n: 'spaces', t: 'spaces_list' }), PlaySoundCmd.init(APP_SOUND.navBackwardMin)],
      }
    }
  }
  return { model }
}

const viewAction = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction => {
  return {
    id: input.ctx.t('app.exit'),
    renderIcon: (iconProps) => h(IconDoorOpen, iconProps),
    label: input.ctx.t('app.exit'),
    onPress: () => input.dispatch({ t: 'exit-space-action.clicked-exit-space-button' }),
  }
}

export const ExitSpaceAction = {
  update,
  viewAction,
}
