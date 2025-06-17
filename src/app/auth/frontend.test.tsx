// import { describe, expect, test } from 'bun:test'
// import { PlaySoundCmd.did, PushScreenCmd.did } from '../@/frontend/cmd'
// import { FixtureAuthFrontend } from './@/fixture/frontend'
// import * as AuthFrontend from './frontend'

// const Fixture = async () => {
//   const f = await FixtureAuthFrontend()

//   return {
//     ...f,
//   }
// }

// describe('Test', () => {
//   test('continue with phone', async () => {
//     const f = await Fixture()
//     const output = AuthFrontend.update({
//       ctx: f.ctx,
//       model: f.initial.model,
//       msg: { t: 'clicked-login-with-phone' },
//     })
//     expect(PlaySoundCmd.did(output)).toBe(true)
//     expect(PushScreenCmd.did(output, (screen) => screen.n === 'auth-login' && screen.t === 'login-sms-request')).toBe(true)
//   })

//   test('continue with email', async () => {
//     const f = await Fixture()
//     const output = AuthFrontend.update({
//       ctx: f.ctx,
//       model: f.initial.model,
//       msg: { t: 'user-clicked-login-with-email' },
//     })
//     expect(PlaySoundCmd.did(output)).toBe(true)
//     expect(PushScreenCmd.did(output, (screen) => screen.n === 'auth-login' && screen.t === 'login-email-send-link')).toBe(
//       true,
//     )
//   })
// })
