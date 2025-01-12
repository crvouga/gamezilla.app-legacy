import { describe, expect, test } from 'bun:test'
import { didPlaySound, didPushRoute } from '../@/frontend/cmd'
import { FixtureAuthFrontend } from './@/fixture/frontend'
import * as AuthFrontend from './frontend'

const Fixture = async () => {
  const f = await FixtureAuthFrontend()

  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  test('continue with phone', async () => {
    const f = await Fixture()
    const output = AuthFrontend.update({
      ctx: f.ctx,
      model: f.initial.model,
      msg: { t: 'user-clicked-login-with-phone' },
    })
    expect(didPlaySound(output)).toBe(true)
    expect(didPushRoute(output, (route) => route.n === 'auth-login' && route.t === 'login-sms-request')).toBe(true)
  })

  test('continue with email', async () => {
    const f = await Fixture()
    const output = AuthFrontend.update({
      ctx: f.ctx,
      model: f.initial.model,
      msg: { t: 'user-clicked-login-with-email' },
    })
    expect(didPlaySound(output)).toBe(true)
    expect(didPushRoute(output, (route) => route.n === 'auth-login' && route.t === 'login-email-send-link')).toBe(true)
  })
})
