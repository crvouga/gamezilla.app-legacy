// import { describe, expect, it } from 'bun:test'
// import { eq } from '~/@/equals/equals'
// import { PhoneNumber } from '~/@/phone-number'
// import { Err, Ok } from '~/@/result'
// import type { Screen } from '~/@/screen/generated/screens'
// import { didPushScreen } from '~/app/@/frontend/cmd'
// import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
// import type { ContinueWithSmsTypes } from '.'
// import { ContinueWithSmsFrontend } from './frontend'

// type Msg =
//   | {
//       msg: ContinueWithSmsTypes.MsgFrontend
//     }
//   | {
//       msgBackend: ContinueWithSmsTypes.MsgToFrontend
//     }

// const Fixture = async (input?: { currentScreen?: Screen }) => {
//   const f = await FixtureAppFrontend({
//     currentScreen: input?.currentScreen ?? {
//       n: 'auth-login',
//       t: 'login-sms-request',
//     },
//   })

//   const updates = (init: ContinueWithSmsTypes.ModelFrontend, msgs: Msg[]) => {
//     const updates: ReturnType<typeof ContinueWithSmsFrontend.update>[] = []
//     let model = init
//     for (const msg of msgs) {
//       const updated = ContinueWithSmsFrontend.update({
//         ctx: f.ctx,
//         model,
//         ...msg,
//       })
//       model = updated.model
//       updates.push(updated)
//     }
//     return updates
//   }

//   const update = (init: ContinueWithSmsTypes.ModelFrontend, msgs: Msg[]) => {
//     const updates_ = updates(init, msgs)
//     return updates_[updates_.length - 1]
//   }

//   const init = ContinueWithSmsFrontend.init({
//     ctx: f.ctx,
//     stored: null,
//   }).model

//   const render = (model: ContinueWithSmsTypes.ModelFrontend = init) => {
//     const vDom = <ContinueWithSmsFrontend.View ctx={f.ctx} dispatch={() => {}} model={model} />
//     const node = f.render(vDom)
//     return node
//   }

//   return {
//     ...f,
//     init,
//     update,
//     render,
//   }
// }

// describe(import.meta.file, () => {
//   it('should navigate to verify code screen after code is sent', async () => {
//     const f = await Fixture()

//     const phoneNumber = PhoneNumber.random()

//     const output = f.update(f.init, [
//       {
//         msgBackend: {
//           t: 'sent-code',
//           phoneNumber,
//           sent: Ok(null),
//         },
//       },
//     ])

//     expect(
//       didPushScreen(
//         output,
//         (msg) => msg.n === 'auth-login' && msg.t === 'login-sms-verify' && eq(msg.phoneNumber, phoneNumber),
//       ),
//     ).toBe(true)
//   })

//   it('should render error message when send code errors', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [
//       {
//         msgBackend: {
//           t: 'sent-code',
//           phoneNumber: PhoneNumber.random(),
//           sent: Err({
//             t: 'hourly-limit-reached',
//           }),
//         },
//       },
//     ])
//     const r = f.render(output?.model)
//     const alertError = r.getByRole('alert', f.ctx.t('verify-sms-problem.send-code-hourly-limit-reached'))
//     expect(alertError).toBeTruthy()
//   })

//   it('should render error message when verify code errors', async () => {
//     const phoneNumber = PhoneNumber.random()

//     const f = await Fixture({
//       currentScreen: {
//         n: 'auth-login',
//         t: 'login-sms-verify',
//         phoneNumber,
//       },
//     })
//     const output = f.update(f.init, [
//       {
//         msgBackend: {
//           t: 'verified-code',
//           verified: Err({
//             t: 'verification-already-verified',
//           }),
//         },
//       },
//     ])
//     const r = f.render(output?.model)
//     const alertError = r.getByRole('alert', f.ctx.t('verify-sms-problem.verification-already-verified'))
//     expect(alertError).toBeTruthy()
//   })

//   it('should render code sent to phone number message', async () => {
//     const phoneNumber = PhoneNumber.random()

//     const f = await Fixture({
//       currentScreen: {
//         n: 'auth-login',
//         t: 'login-sms-verify',
//         phoneNumber,
//       },
//     })
//     const r = f.render(f.init)
//     const p = r.getByRole('status', f.ctx.t('auth-sms.enter-code-sent-to', PhoneNumber.format(phoneNumber)))
//     expect(p).toBeTruthy()
//   })
// })
