import { Loading, Ok } from '~/@/result'
import { APP_SOUND, playSound, sendToBackend, showToast } from '~/app/@/frontend/cmd'
import { Button, IconPlus } from '~/app/@/ui'
import type { FrontendModule } from '../../types'

const update: FrontendModule['update'] = (input) => {
  const { model, msg, msgSpace, msgBackend } = input

  switch (msg?.t) {
    case 'create-new-pack.clicked-create-button': {
      return {
        model: {
          ...model,
          packCreateNewRequest: Loading,
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToBackend({
            t: 'create-new-pack.clicked-create-button',
          }),
        ],
      }
    }
  }

  switch (msgBackend?.t) {
    case 'create-new-pack.created-pack': {
      return {
        model,
        msgSpace: [
          {
            t: 'user-created-pack',
            created: msgBackend.created,
            userId: input.ctx.currentUserId,
          },
        ],
      }
    }
  }

  switch (msgSpace?.t) {
    case 'user-created-pack': {
      return {
        model: {
          ...model,
          packCreateNewRequest: Ok(null),
        },
        msgCmd: [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.pack-created'))],
      }
    }
  }

  return { model }
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
