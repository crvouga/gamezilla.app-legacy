import { describe, expect, it } from 'bun:test'
import { isRequesting, isResponseErr, isResponseOk } from '~/@/request-response/request-response'
import { Err, Ok } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { didPlaySound, didSendToServer } from '~/app/@/client/client-cmd'
import { AnonymousClientCtx } from '~/app/@/client/client-ctx'
import { Translator } from '~/app/@/client/translator'
import { UserId } from '~/app/@/data/user-id'
import * as AuthClient from '../client'
import type { ModelClient } from '../types'

const ctx: AnonymousClientCtx = {
  currentRoute: {
    n: 'auth-login',
    t: 'login'
  },
  navigatorLanguage: 'en',
  t: Translator('en'),
  documentVisibilityState: 'visible',
  now: Posix.now(),
  profiles: {},
  currentUserId: null
}

const clickedContinueAsGuestButton = (model: ModelClient) =>
  AuthClient.update({
    model,
    ctx,
    msg: {
      t: 'guest.clicked-continue-as-guest-button'
    }
  })

const continueAsGuestResultedOk = (userId: UserId) => (model: ModelClient) =>
  AuthClient.update({
    model,
    ctx,
    msgServer: {
      t: 'guest.continue-as-guest-result',
      result: Ok(userId)
    }
  })

const continueAsGuestResultedErr = () => (model: ModelClient) =>
  AuthClient.update({
    model,
    ctx,
    msgServer: {
      t: 'guest.continue-as-guest-result',
      result: Err('some error happened')
    }
  })

describe(import.meta.file, () => {
  it('should request to continue as guest when button is clicked', () => {
    const output = AppClientModule.andThen(
      AuthClient.init({
        ctx,
        stored: {}
      }),
      clickedContinueAsGuestButton
    )

    expect(isRequesting(output.model.guestRequest) && output.model.guestRequest.requestedAt === ctx.now).toBe(true)
  })

  it('should request to continue as guest when button is clicked', () => {
    const output = AppClientModule.andThen(
      AuthClient.init({
        ctx,
        stored: {}
      }),
      clickedContinueAsGuestButton
    )

    expect(didSendToServer(output, (msg) => msg.t === 'guest.clicked-continue-as-guest-button')).toBe(true)
  })

  it('should resolve request as ok when resulted in ok', () => {
    const output = AppClientModule.andThen(
      AuthClient.init({
        ctx,
        stored: {}
      }),
      clickedContinueAsGuestButton,
      continueAsGuestResultedOk(UserId.generate())
    )
    expect(isResponseOk(output.model.guestRequest)).toBe(true)
  })

  it('should resolve request as err when resulted in err', () => {
    const output = AppClientModule.andThen(
      AuthClient.init({
        ctx,
        stored: {}
      }),
      clickedContinueAsGuestButton,
      continueAsGuestResultedErr()
    )
    expect(isResponseErr(output.model.guestRequest)).toBe(true)
  })

  it('should play sound after continuing as guest', () => {
    const output = AppClientModule.andThen(
      AuthClient.init({
        ctx,
        stored: {}
      }),
      clickedContinueAsGuestButton
    )
    expect(didPlaySound(output)).toBe(true)
  })
})
