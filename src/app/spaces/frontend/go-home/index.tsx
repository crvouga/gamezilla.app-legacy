import { pushScreen, playSound, APP_SOUND } from '~/app/@/frontend/cmd'
import type { SpaceFrontendModule } from '../../@/architecture/space-frontend'
import { IconButton, IconHome } from '~/@/ui'

const update: SpaceFrontendModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'clicked-go-home-button': {
      return {
        model,
        msgCmd: [
          pushScreen({
            n: 'spaces',
            t: 'space-list',
          }),
          playSound(APP_SOUND.navBackwardMin),
        ],
      }
    }
    default: {
      return {
        model,
      }
    }
  }
}

const ViewIconButton: SpaceFrontendModule['View'] = (input) => {
  return (
    <IconButton
      onClick={() =>
        input.dispatch({
          t: 'clicked-go-home-button',
        })
      }
      label={input.ctx.t('spaces.home')}
      renderIcon={(inputIcon) => <IconHome {...inputIcon} />}
    />
  )
}

export const GoHome = {
  update,
  ViewIconButton,
}
