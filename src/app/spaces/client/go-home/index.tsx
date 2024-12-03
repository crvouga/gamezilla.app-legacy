import { APP_SOUND, playSound, pushRoute } from 'app/@/client'
import type { SpaceClientModule } from '../../@/architecture/space-client'
import { IconButton, IconHome } from 'app/@/ui'

const update: SpaceClientModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'clicked-go-home-button': {
      return {
        model,
        msgCmd: [
          pushRoute({
            n: 'spaces',
            t: 'space-list'
          }),
          playSound(APP_SOUND.navBackwardMin)
        ]
      }
    }
    default: {
      return {
        model
      }
    }
  }
}

const ViewIconButton: SpaceClientModule['View'] = (input) => {
  return (
    <IconButton
      onClick={() =>
        input.dispatch({
          t: 'clicked-go-home-button'
        })
      }
      label={input.ctx.t('spaces.home')}
      renderIcon={(inputIcon) => <IconHome {...inputIcon} />}
    />
  )
}

export const GoHome = {
  update,
  ViewIconButton
}
