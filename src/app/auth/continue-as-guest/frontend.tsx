import { isRequesting, isResponseOk, RequestResponse } from '~/@/request-response/request-response'
import { isErr, NotAsked } from '~/@/result'
import { APP_SOUND, playSound, sendToBackend, showErrSm } from '~/app/@/frontend/cmd'
import { Button, IconUserCircle } from '~/@/ui'
import type { FrontendModule } from '../types'
import type { ModelFrontend } from './types'

const initModel: ModelFrontend = {
  guestRequest: NotAsked,
}

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'guest.clicked-continue-as-guest-button': {
      return {
        model: {
          ...input.model,
          guestRequest: RequestResponse.startedRequest(input.ctx.now),
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToBackend({
            t: 'guest.clicked-continue-as-guest-button',
          }),
        ],
      }
    }
  }

  switch (input.msgEvt?.t) {
    case 'auth-evt.authenticated': {
      return {
        model: {
          ...input.model,
          guestRequest: {
            t: 'not-asked',
          },
        },
      }
    }
  }

  switch (input.msgBackend?.t) {
    case 'guest.continue-as-guest-result': {
      return {
        model: {
          ...input.model,
          guestRequest: RequestResponse.response(input.model.guestRequest, input.ctx.now, input.msgBackend.result),
        },
        msgCmd: isErr(input.msgBackend.result) ? showErrSm(input.ctx.t('auth.continue-as-guest.errored')) : [],
      }
    }
  }

  return {
    model: input.model,
  }
}

const ViewButton: FrontendModule['View'] = (input) => {
  return (
    <Button
      onClick={() => input.dispatch({ t: 'guest.clicked-continue-as-guest-button' })}
      iconStart={(iconInput) => <IconUserCircle {...iconInput} />}
      text={input.ctx.t('auth.continue-as-guest')}
      loading={isRequesting(input.model.guestRequest) || isResponseOk(input.model.guestRequest)}
    />
  )
}

export const ContinueAsGuestFrontend = {
  initModel,
  update,
  ViewButton,
}
