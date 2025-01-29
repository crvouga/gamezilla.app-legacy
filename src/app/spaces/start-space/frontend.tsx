import { withEventId } from '~/@/event-sourced/event'
import { IconPlus } from '~/@/ui'
import { SpaceId } from '~/app/@/data/space-id'
import { APP_SOUND, playSound, pushScreen, showToast } from '~/app/@/frontend/cmd'
import { CreateActionProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { SpaceFrontendModule } from '../@/architecture/space-frontend'
import type { MsgSpace } from '../core/space-msg'

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
      if (msgSpace.userId === ctx.currentUserId) {
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.navForward),
            pushScreen({ n: 'spaces', t: 'space', spaceId: msgSpace.spaceId }),
            showToast(ctx.t('spaces.space-started')),
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
    case 'clicked-start-space-button': {
      if (!input.ctx.currentUserId) {
        return {
          model: input.model,
        }
      }

      const spaceEventNew = withEventId<MsgSpace>({
        t: 'user-started-space',
        spaceId: input.msg.spaceId,
        userId: input.ctx.currentUserId,
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

export const viewStartSpaceButton = (input: Parameters<SpaceFrontendModule['View']>[0]): CreateActionProps | null => {
  if (!input.ctx.currentUserId) return null

  const currentUserSpaceId = input.model.indexSpaceIdByUserId[input.ctx.currentUserId]

  if (currentUserSpaceId) return null

  return {
    onSubmit: () => input.dispatch({ t: 'clicked-start-space-button', spaceId: SpaceId.generate() }),
    submitText: input.ctx.t('spaces.start-space'),
    submitIcon: (iconInput) => <IconPlus {...iconInput} />,
    submitDisabled: false,
    submitLoading: false,
  }
}

export const StartSpaceFrontend = {
  viewStartSpaceButton,
  update,
}
