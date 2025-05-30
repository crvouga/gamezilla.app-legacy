// import { describe, expect, test } from 'bun:test'
// import { pipe } from '~/@/function/pipe'
// import { Ok } from '~/@/result'
// import { ClientSessionId } from '~/@/wire/client-session-id'
// import { FixtureAppBackend } from '~/app/@/backend/fixture'
// import { ClientId } from '../../@/wire/client-id'
// import { SessionId } from '../../@/wire/session-id'
// import { UserAccount } from '../@/data/user-account'
// import { WireBackend } from './backend'
// import { initBackendTransport, ToFrontendPayload } from './transport/backend'
// import { WireSession } from './wire-session'

// export type Input = Partial<Parameters<typeof WireBackend.update>[0]>

// export type Output = Awaited<ReturnType<typeof WireBackend.update>>

// const Fixture = async () => {
//   const f = await FixtureAppBackend()

//   const ctx = await WireBackend.initCtx({ ctx: f.ctx, transport: initBackendTransport() })

//   const updates = async (initial: Output, inputs: Input[]): Promise<Output[]> => {
//     const outputs: Output[] = [initial]
//     for (const input of inputs) {
//       const output = await WireBackend.update({
//         ...input,
//         ctx: input.ctx ?? ctx,
//       })
//       outputs.push(output)
//     }
//     return outputs
//   }

//   const update = async (initial: Output, inputs: Input[]): Promise<Output> => {
//     const outputs = await updates(initial, inputs)
//     return outputs[outputs.length - 1] ?? initial
//   }

//   return {
//     ...f,
//     ctx,
//     update,
//     updates,
//   }
// }

// describe(import.meta.file, () => {
//   test('recording connected clients', async () => {
//     const f = await Fixture()
//     const clientId = ClientId.generate()
//     const sessionId = SessionId.generate()
//     const clientSessionId = ClientSessionId.generate()
//     const before = await f.ctx.wireSessionDb.findBySessionIds([sessionId])
//     await f.update({}, [{ msg: { t: 'frontend-connected', clientId, sessionId, clientSessionId } }])
//     const after = await f.ctx.wireSessionDb.findBySessionIds([sessionId])
//     const expected: WireSession = pipe(WireSession.init(sessionId), (x) => WireSession.addClientId(x, clientId))
//     expect(before).toEqual(Ok([]))
//     expect(after).toEqual(Ok([expected]))
//   })
// })
