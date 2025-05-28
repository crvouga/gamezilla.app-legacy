import { IconDoorOpen } from '~/@/ui/icon/icon-door-open'
import { APP_SOUND } from '~/app/@/frontend/cmd'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import type { SpaceFrontendModule } from '../../architecture/space-frontend'

const update: SpaceFrontendModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'exit-space-action.clicked-exit-space-button': {
      return {
        model,
        msgOut: [PushScreenCmd.init({ n: 'spaces', t: 'space-list' }), PlaySoundCmd.init(APP_SOUND.navBackwardMin)],
      }
    }
  }
  return { model }
}

const viewAction = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction => {
  return {
    id: input.ctx.t('app.exit'),
    icon: (inputIcon) => <IconDoorOpen {...inputIcon} />,
    label: input.ctx.t('app.exit'),
    onClick: () => input.dispatch({ t: 'exit-space-action.clicked-exit-space-button' }),
  }
}

export const ExitSpaceAction = {
  update,
  viewAction,
}
