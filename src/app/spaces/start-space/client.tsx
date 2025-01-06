import { withEventId } from '~/@/event-sourced/event'
import { APP_SOUND, playSound, pushRoute, showToast } from '~/app/@/client/cmd'
import { SpaceId } from '~/app/@/data/space-id'
import { Button, IconPlus } from '~/app/@/ui'
import { SpaceClientModule } from '../@/architecture/space-client'
import type { SpaceEvent } from '../core/space-event'

const update: SpaceClientModule['update'] = (input) => {
  return SpaceClientModule.andThen(
    { model: input.model },
    (model) => updateFromSpaceEvent({ ...input, model }),
    (model) => updateStartSpaceButton({ ...input, model }),
  )
}

const updateFromSpaceEvent: SpaceClientModule['update'] = ({ model, msgCore: msgCore, ctx }) => {
  switch (msgCore?.t) {
    case 'user-started-space': {
      if (msgCore.userId === ctx.currentUserId) {
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.navForward),
            pushRoute({ n: 'spaces', t: 'space', spaceId: msgCore.spaceId }),
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

const updateStartSpaceButton: SpaceClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'clicked-start-space-button': {
      if (!input.ctx.currentUserId) {
        return {
          model: input.model,
        }
      }

      const spaceEventNew = withEventId<SpaceEvent>({
        t: 'user-started-space',
        spaceId: input.msg.spaceId,
        userId: input.ctx.currentUserId,
      })

      return {
        model: input.model,
        msgCore: [spaceEventNew],
      }
    }
    default: {
      return {
        model: input.model,
      }
    }
  }
}

const ViewStartSpaceButton: SpaceClientModule['View'] = (input) => {
  return (
    <Button
      rounded
      size='lg'
      color='primary'
      variant='contained'
      iconStart={(iconInput) => <IconPlus {...iconInput} />}
      onClick={() => input.dispatch({ t: 'clicked-start-space-button', spaceId: SpaceId.generate() })}
      text={input.ctx.t('spaces.start-space')}
    />
  )
}

export const StartSpaceClient = {
  ViewStartSpaceButton,
  update,
}
