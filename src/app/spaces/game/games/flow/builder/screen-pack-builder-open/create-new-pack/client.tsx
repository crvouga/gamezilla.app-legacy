import { Loading, Ok } from '~/@/result'
import { APP_SOUND, playSound, sendToServer, showToast } from '~/app/@/client/cmd'
import { Button, IconPlus } from '~/app/@/ui'
import type { ClientModule } from '../../types'

const update: ClientModule['update'] = (input) => {
  const { model, msg, msgCore, msgServer } = input

  switch (msg?.t) {
    case 'create-new-pack.clicked-create-button': {
      return {
        model: {
          ...model,
          packCreateNewRequest: Loading,
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToServer({
            t: 'create-new-pack.clicked-create-button',
          }),
        ],
      }
    }
  }

  switch (msgServer?.t) {
    case 'create-new-pack.created-pack': {
      return {
        model,
        msgCore: [
          {
            t: 'user-created-pack',
            created: msgServer.created,
            userId: input.ctx.currentUserId,
          },
        ],
      }
    }
  }

  switch (msgCore?.t) {
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

const ViewCreateFab: ClientModule['View'] = (input) => {
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

export const PackCreateNewClient = {
  update,
  ViewCreateFab,
}
