import { Loading, Ok } from '~/@/result'
import { APP_SOUND, playSound, showToast } from '~/app/@/frontend/cmd'
import { Button, IconPlus } from '~/app/@/ui'
import { Pack } from '../../../@/pack/pack'
import { PackId } from '../../../@/pack/pack-id'
import { PackName } from '../../../@/pack/pack-name'
import type { FrontendModule } from '../../types'
import { withEventId } from '~/@/event-sourced/event'

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'create-new-pack.clicked-create-button': {
      return {
        model: {
          ...input.model,
          packCreateNewRequest: Loading,
        },
        msgCmd: [playSound(APP_SOUND.tap)],
        async eff(dispatch) {
          const userId = input.ctx.currentUserId
          const packNew: Pack = {
            isOfficial: false,
            createdAt: input.ctx.now,
            createdBy: userId,
            id: PackId.generate(),
            lastUpdatedAt: input.ctx.now,
            lastUpdatedBy: userId,
            name: await PackName.generate(),
            puzzleIds: [],
          }

          const created = await input.ctx.packDb.put(packNew)

          dispatch({ t: 'create-new-pack.db-put-pack', created, userId })
        },
      }
    }
    case 'create-new-pack.db-put-pack': {
      return {
        model: {
          ...input.model,
          packCreateNewRequest: Ok(null),
        },
        msgCmd: [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.pack-created'))],
        msgSpace: [withEventId({ ...input.msg, t: 'create-new-pack.user-created-pack' })],
      }
    }
  }

  return { model: input.model }
}

const ViewCreateFab: FrontendModule['View'] = (input) => {
  return (
    <Button
      rounded
      text={input.ctx.t('flow.create-pack')}
      variant='contained'
      color='primary'
      loading={input.model.packCreateNewRequest.t === 'loading'}
      iconStart={(iconInput) => <IconPlus {...iconInput} />}
      onClick={() =>
        input.dispatch({
          t: 'create-new-pack.clicked-create-button',
        })
      }
    />
  )
}

export const PackCreateNewFrontend = {
  update,
  ViewCreateFab,
}
