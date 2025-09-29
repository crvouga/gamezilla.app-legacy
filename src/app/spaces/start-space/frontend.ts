import { withEventId } from '~/@/event-sourced/event'
import { IconPlus } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { SpaceId } from '~/app/@/data/space-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ActionCreateProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { SpaceFrontendModule } from '../frontend/space-frontend'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateStartSpaceButton({ ...input, model }),
  )
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = ({ model, msgSpace: msgSpace, ctx }) => {
  switch (msgSpace?.t) {
    case 'user-started-space': {
      if (msgSpace.userId === ctx.currentUser?.userId) {
        return {
          model,
          msgOut: [
            PushScreenCmd.init({ n: 'spaces', t: 'spaces_space', spaceId: msgSpace.spaceId }),
            PlaySoundCmd.init(APP_SOUND.navForward),
            ShowToastCmd.init(ctx.t('spaces.space-started')),
          ],
        }
      }

      return {
        model,
      }
    }
    default: {
      return {
        model,
      }
    }
  }
}

const updateStartSpaceButton: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'start-space.clicked-start-space-button': {
      if (!input.ctx.currentUser?.userId) {
        return {
          model: input.model,
        }
      }

      const spaceEventNew = withEventId<MsgSpace>({
        t: 'user-started-space',
        spaceId: input.msg.spaceId,
        userId: input.ctx.currentUser.userId,
      })

      return {
        model: input.model,
        msgSpace: [spaceEventNew],
      }
    }
    default: {
      return {
        model: input.model,
      }
    }
  }
}

export const viewStartSpaceButton = (input: Parameters<SpaceFrontendModule['View']>[0]): ActionCreateProps | null => {
  if (!input.ctx.currentUser?.userId) return null
  const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)
  const currentUserSpaceProjection = currentUserSpace ? Space.toSpaceProjection(currentUserSpace) : null
  if (currentUserSpaceProjection?.type === 'started') return null
  return {
    onSubmit: () => input.dispatch({ t: 'start-space.clicked-start-space-button', spaceId: SpaceId.generate() }),
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
