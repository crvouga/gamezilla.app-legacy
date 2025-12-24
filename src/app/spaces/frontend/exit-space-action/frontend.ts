import { Eff } from '~/@/eff'
import { IconDoorOpen } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { pushScreen } from '~/app/frontend/current-screen/current-screen-cmd'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import type { FrontendCtxModule, ModelFrontend } from '../../base-types'

export type Msg = { t: 'exitSpaceAction_clicked' }

const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: Msg
}): {
  model: ModelFrontend
  eff: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'exitSpaceAction_clicked': {
      return {
        model: input.model,
        eff: Eff.batch([pushScreen({ n: 'spaces', t: 'spaces_list' }), playSound(APP_SOUND.navBackwardMin)]),
      }
    }
  }
}

const viewAction = (input: { ctx: FrontendCtxModule; dispatch: (msg: Msg) => void }): ScreenAction => {
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
