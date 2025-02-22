import { describe, expect, it } from 'bun:test'
import { dbConnSqlNoop } from '~/@/db-conn-sql/impl'
import { loggerNoop } from '~/@/logger/impl-noop'
import { isRequesting, isResponseErr, isResponseOk } from '~/@/request-response/request-response'
import { Err, Ok } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { UserId } from '~/app/@/data/user-id'
import { didPlaySound, didSendToBackend } from '~/app/@/frontend/cmd'
import { AnonymousFrontendCtx } from '~/app/@/frontend/ctx'
import { Translator } from '~/app/@/frontend/translator'
import * as AuthFrontend from '../frontend'
import type { ModelFrontend } from '../types'

const ctx: AnonymousFrontendCtx = {
  parentScreen: null,
  dbConnSql: dbConnSqlNoop,
  logger: loggerNoop,
  currentScreen: {
    n: 'auth-login',
    t: 'login',
  },
  navigatorLanguage: 'en',
  t: Translator('en'),
  documentVisibilityState: 'visible',
  now: Posix.now(),
  profiles: {},
  screenSize: 'mobile',
}

const clickedContinueAsGuestButton = (model: ModelFrontend) =>
  AuthFrontend.update({
    model,
    ctx,
    msg: {
      t: 'guest.clicked-continue-as-guest-button',
    },
  })

const continueAsGuestResultedOk = (userId: UserId) => (model: ModelFrontend) =>
  AuthFrontend.update({
    model,
    ctx,
    msgBackend: {
      t: 'guest.continue-as-guest-result',
      result: Ok(userId),
    },
  })

const continueAsGuestResultedErr = () => (model: ModelFrontend) =>
  AuthFrontend.update({
    model,
    ctx,
    msgBackend: {
      t: 'guest.continue-as-guest-result',
      result: Err('some error happened'),
    },
  })

describe(import.meta.file, () => {
  it('should request to continue as guest when button is clicked', () => {
    const output = AppFrontendModule.andThen(
      AuthFrontend.init({
        ctx,
        stored: {},
      }),
      clickedContinueAsGuestButton,
    )

    expect(isRequesting(output.model.guestRequest) && output.model.guestRequest.requestedAt === ctx.now).toBe(true)
  })

  it('should request to continue as guest when button is clicked', () => {
    const output = AppFrontendModule.andThen(
      AuthFrontend.init({
        ctx,
        stored: {},
      }),
      clickedContinueAsGuestButton,
    )

    expect(didSendToBackend(output, (msg) => msg.t === 'guest.clicked-continue-as-guest-button')).toBe(true)
  })

  it('should resolve request as ok when resulted in ok', () => {
    const output = AppFrontendModule.andThen(
      AuthFrontend.init({
        ctx,
        stored: {},
      }),
      clickedContinueAsGuestButton,
      continueAsGuestResultedOk(UserId.generate()),
    )
    expect(isResponseOk(output.model.guestRequest)).toBe(true)
  })

  it('should resolve request as err when resulted in err', () => {
    const output = AppFrontendModule.andThen(
      AuthFrontend.init({
        ctx,
        stored: {},
      }),
      clickedContinueAsGuestButton,
      continueAsGuestResultedErr(),
    )
    expect(isResponseErr(output.model.guestRequest)).toBe(true)
  })

  it('should play sound after continuing as guest', () => {
    const output = AppFrontendModule.andThen(
      AuthFrontend.init({
        ctx,
        stored: {},
      }),
      clickedContinueAsGuestButton,
    )
    expect(didPlaySound(output)).toBe(true)
  })
})
