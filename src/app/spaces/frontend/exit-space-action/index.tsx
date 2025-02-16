import { IconDoorOpen } from '~/@/ui/icon/icon-door-open'
import { APP_SOUND, playSound, pushScreen } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import type { SpaceFrontendModule } from '../../architecture/space-frontend'

const update: SpaceFrontendModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'clicked-exit-space-button': {
      return { model, msgCmd: [pushScreen({ n: 'spaces', t: 'space-list' }), playSound(APP_SOUND.navBackwardMin)] }
    }
  }
  return { model }
}

const viewAction = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction => {
  return {
    icon: (inputIcon) => <IconDoorOpen {...inputIcon} />,
    label: input.ctx.t('app.exit'),
    onClick: () => input.dispatch({ t: 'clicked-exit-space-button' }),
  }
}

export const ExitSpaceAction = {
  update,
  viewAction,
}
