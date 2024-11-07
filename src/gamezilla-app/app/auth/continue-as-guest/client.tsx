import { RequestResponse, isRequesting, NotAsked, isErr } from '@/core'
import { APP_SOUND, playSound, sendToServer, showErrSm } from 'gamezilla-app/app/@/client'
import { Button, IconUserCircle } from 'gamezilla-app/app/@/ui'
import type { ClientModule } from '../types'
import type { ModelClient } from './types'

const initModel: ModelClient = {
  guestRequest: NotAsked
}

const update: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'guest.clicked-continue-as-guest-button': {
      return {
        model: {
          ...input.model,
          guestRequest: RequestResponse.startedRequest(input.ctx.now)
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToServer({
            t: 'guest.clicked-continue-as-guest-button'
          })
        ]
      }
    }
  }

  switch (input.msgServer?.t) {
    case 'guest.continue-as-guest-result': {
      return {
        model: {
          ...input.model,
          guestRequest: RequestResponse.response(input.model.guestRequest, input.ctx.now, input.msgServer.result)
        },
        msgCmd: isErr(input.msgServer.result) ? showErrSm(input.ctx.t('auth.continue-as-guest.errored')) : []
      }
    }
  }

  return {
    model: input.model
  }
}

const ViewButton: ClientModule['View'] = (input) => {
  return (
    <Button
      onClick={() =>
        input.dispatch({
          t: 'guest.clicked-continue-as-guest-button'
        })
      }
      renderIconStart={(iconInput) => <IconUserCircle {...iconInput} />}
      text={input.ctx.t('auth.continue-as-guest')}
      loading={isRequesting(input.model.guestRequest)}
    />
  )
}

export const ContinueAsGuestClient = {
  initModel,
  update,
  ViewButton
}
