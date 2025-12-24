import { Eff } from '~/@/eff'
import { withEventMeta } from '~/@/event-sourced/event'
import { IconPlus } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { SpaceId } from '~/app/@/data/space-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { pushScreen } from '~/app/frontend/current-screen/current-screen-cmd'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { showToast } from '~/app/@/frontend/toaster-cmd'
import { ActionCreateProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace, spaceMsgs } from '../space/msg-space'
import { Space } from '../space/space'
import type { FrontendCtxModule, ModelFrontend } from '../base-types'
import { Msg } from './types'

export const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: Msg
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  switch (input.msg?.t) {
    case 'startSpace_clickedStartSpaceButton': {
      if (!input.ctx.currentUser?.userId) {
        return {
          model: input.model,
        }
      }

      const spaceEventNew = withEventMeta<MsgSpace>({
        t: 'userStartedSpace',
        spaceId: input.msg.spaceId,
        userId: input.ctx.currentUser.userId,
      })

      return {
        model: input.model,
        eff: () => {
          spaceMsgs.pub(spaceEventNew)
        },
      }
    }
    case 'startSpace_gotMsgSpace': {
      const msgSpace = input.msg.c
      switch (msgSpace.t) {
        case 'userStartedSpace': {
          if (msgSpace.userId === input.ctx.currentUser?.userId) {
            return {
              model: input.model,
              eff: Eff.batch([
                pushScreen({ n: 'spaces', t: 'spaces_space', spaceId: msgSpace.spaceId }),
                playSound(APP_SOUND.navForward),
                showToast(input.ctx.t('spaces.space-started')),
              ]),
            }
          }

          return input
        }
        default: {
          return input
        }
      }
    }
    default: {
      return input
    }
  }
}

export const viewStartSpaceButton = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  dispatch: (msg: Msg) => void
}): ActionCreateProps | null => {
  if (!input.ctx.currentUser?.userId) return null
  const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)
  const currentUserSpaceProjection = currentUserSpace ? Space.toSpaceProjection(currentUserSpace) : null
  if (currentUserSpaceProjection?.type === 'started') return null
  return {
    onSubmit: () => input.dispatch({ t: 'startSpace_clickedStartSpaceButton', spaceId: SpaceId.generate() }),
    submitText: input.ctx.t('spaces.start-space'),
    submitIcon: (iconInput) => h(IconPlus, iconInput),
    submitDisabled: false,
    submitLoading: false,
  }
}
