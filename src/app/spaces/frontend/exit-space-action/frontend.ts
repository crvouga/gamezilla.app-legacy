import { IconDoorOpen } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { FrontendCtxModule, ModelFrontend } from '../../types'
import type { SpaceFrontendModule } from '../space-frontend'
import { isMsgFrontend } from './types'

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  msgOut?: unknown[]
} => {
  if (!isMsgFrontend(input.msg)) return input

  switch (input.msg?.t) {
    case 'exitSpaceAction_clicked': {
      return {
        model: input.model,
        msgOut: [PushScreenCmd.init({ n: 'spaces', t: 'spaces_list' }), PlaySoundCmd.init(APP_SOUND.navBackwardMin)],
      }
    }
  }
}

const viewAction = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction => {
  return {
    id: input.ctx.t('app.exit'),
    renderIcon: (iconProps) => h(IconDoorOpen, iconProps),
    label: input.ctx.t('app.exit'),
    onPress: () => input.dispatch({ t: 'exitSpaceAction_clicked' }),
  }
}

export const ExitSpaceAction = {
  update,
  viewAction,
}
