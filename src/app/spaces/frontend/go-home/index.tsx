import { IconButton, IconHome } from '~/@/ui'
import { APP_SOUND, playSound, pushScreen } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/ui/screen-actions/props'
import type { SpaceFrontendModule } from '../../@/architecture/space-frontend'

const update: SpaceFrontendModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'clicked-go-home-button': {
      return { model, msgCmd: [pushScreen({ n: 'spaces', t: 'space-list' }), playSound(APP_SOUND.navBackwardMin)] }
    }
  }
  return { model }
}

const ViewIconButton: SpaceFrontendModule['View'] = (input) => {
  return (
    <IconButton
      onClick={() => input.dispatch({ t: 'clicked-go-home-button' })}
      label={input.ctx.t('spaces.home')}
      renderIcon={(inputIcon) => <IconHome {...inputIcon} />}
    />
  )
}

const viewAction = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction => {
  return {
    icon: (inputIcon) => <IconHome {...inputIcon} />,
    label: input.ctx.t('spaces.home'),
    onClick: () => input.dispatch({ t: 'clicked-go-home-button' }),
  }
}

export const GoHome = {
  update,
  viewAction,
  ViewIconButton,
}
