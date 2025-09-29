import { withEventMeta } from '~/@/event-sourced/event'
import { IconPlus } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { SpaceId } from '~/app/@/data/space-id'
import { andThen } from '~/app/@/frontend/and-then'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ActionCreateProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { GotSpaceMsg } from '../@/got-space-msg.$msg'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space'
import { FrontendCtxModule, ModelFrontend } from '../types'
import { isMsgFrontend, MsgFrontend } from './types'

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  msgOut?: unknown[]
} => {
  return andThen<T, MsgFrontend>(
    { model: input.model },
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateStartSpaceButton({ ...input, model }),
  )
}

const updateFromMsgSpace: typeof update = (input) => {
  if (!GotSpaceMsg.is(input.msgIn)) return input
  const msgSpace = input.msgIn.c

  switch (msgSpace?.t) {
    case 'user-started-space': {
      if (msgSpace.userId === input.ctx.currentUser?.userId) {
        return {
          model: input.model,
          msgOut: [
            PushScreenCmd.init({ n: 'spaces', t: 'spaces_space', spaceId: msgSpace.spaceId }),
            PlaySoundCmd.init(APP_SOUND.navForward),
            ShowToastCmd.init(input.ctx.t('spaces.space-started')),
          ],
        }
      }

      return input
    }
    default: {
      return input
    }
  }
}

const updateStartSpaceButton: typeof update = (input) => {
  if (!isMsgFrontend(input.msg)) return input

  switch (input.msg?.t) {
    case 'startSpace_clickedStartSpaceButton': {
      if (!input.ctx.currentUser?.userId) {
        return {
          model: input.model,
        }
      }

      const spaceEventNew = withEventMeta<MsgSpace>({
        t: 'user-started-space',
        spaceId: input.msg.spaceId,
        userId: input.ctx.currentUser.userId,
      })

      return {
        model: input.model,
        msgOut: [GotSpaceMsg.init(spaceEventNew)],
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
  dispatch: (msg: MsgFrontend) => void
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

export const StartSpaceFrontend = {
  viewStartSpaceButton,
  update,
}
