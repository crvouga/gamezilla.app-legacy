import { describe, expect, test } from 'bun:test'
import { pipe } from '~/@/function/pipe'
import { Ok } from '~/@/result'
import { UserAccount } from '../@/data/account'
import { FrontendId } from '../@/data/frontend-id'
import { SessionId } from '../@/data/session-id'
import { FixtureAppBackend } from '../@/backend/fixture'
import * as WireBackend from './backend'
import { initBackendTransport, ToFrontendPayload } from './transport/backend'
import { WireSession } from './wire-session'

export type Input = Partial<Parameters<typeof WireBackend.update>[0]>

export type Output = Awaited<ReturnType<typeof WireBackend.update>>

const Fixture = async () => {
  const f = await FixtureAppBackend()

  const ctx = await WireBackend.initCtx({ ctx: f.ctx, transport: initBackendTransport() })

  const updates = async (initial: Output, inputs: Input[]): Promise<Output[]> => {
    const outputs: Output[] = [initial]
    for (const input of inputs) {
      const output = await WireBackend.update({
        ...input,
        ctx: input.ctx ?? ctx,
      })
      outputs.push(output)
    }
    return outputs
  }

  const update = async (initial: Output, inputs: Input[]): Promise<Output> => {
    const outputs = await updates(initial, inputs)
    return outputs[outputs.length - 1] ?? initial
  }

  return {
    ...f,
    ctx,
    update,
    updates,
  }
}

describe(import.meta.file, () => {
  test('recording connected frontends', async () => {
    const f = await Fixture()

    const frontendId = FrontendId.generate()
    const sessionId = SessionId.generate()

    const before = await f.ctx.wireSessionDb.findBySessionIds([sessionId])

    await f.update({}, [{ msg: { t: 'frontend-connected', frontendId, sessionId } }])

    const after = await f.ctx.wireSessionDb.findBySessionIds([sessionId])

    const expected: WireSession = pipe(WireSession.init(sessionId), (x) => WireSession.addFrontendId(x, frontendId))

    expect(before).toEqual(Ok([]))
    expect(after).toEqual(Ok([expected]))
  })

  test('indexing frontends by user id', async () => {
    const f = await Fixture()
    const user = UserAccount.random()
    const frontendId = FrontendId.generate()
    const sessionId = SessionId.generate()

    const before = await f.ctx.wireSessionDb.findByUserIds([user.userId])

    await f.update({}, [
      { msg: { t: 'frontend-connected', frontendId, sessionId } },
      { msgEvt: { t: 'auth-evt.frontend-authenticated', user, frontendId, sessionId } },
    ])

    const after = await f.ctx.wireSessionDb.findByUserIds([user.userId])

    const expected: WireSession = pipe(
      WireSession.init(sessionId),
      (x) => WireSession.addFrontendId(x, frontendId),
      (x) => WireSession.addUserId(x, user.userId),
    )

    expect(before).toEqual(Ok([]))
    expect(after).toEqual(Ok([expected]))
  })

  test('send to frontend', async () => {
    const f = await Fixture()
    const frontendId = FrontendId.generate()
    const sessionId = SessionId.generate()
    const msg = {
      t: 'ping',
    }

    const actual: ToFrontendPayload<unknown>[] = []
    f.ctx.transport.toFrontend.sub((payload) => {
      actual.push(payload)
    })

    await f.update({}, [
      { msg: { t: 'frontend-connected', frontendId, sessionId } },
      { msgCmd: { t: 'wire', c: { t: 'send-to-frontend', frontendIds: [frontendId], msg } } },
    ])

    const expected: ToFrontendPayload<unknown>[] = [{ [frontendId]: { frontendId, msgs: [msg] } }]

    expect(actual).toEqual(expected)
  })

  test('send to user', async () => {
    const f = await Fixture()
    const user = UserAccount.random()
    const frontendId = FrontendId.generate()
    const sessionId = SessionId.generate()
    const msg = {
      t: 'ping',
    }

    const actual: ToFrontendPayload<unknown>[] = []
    f.ctx.transport.toFrontend.sub((payload) => {
      actual.push(payload)
    })

    await f.update({}, [
      { msg: { t: 'frontend-connected', frontendId, sessionId } },
      { msgEvt: { t: 'auth-evt.frontend-authenticated', frontendId, sessionId, user } },
      { msgCmd: { t: 'wire', c: { t: 'send-to-user', userIds: [user.userId], msg } } },
    ])

    const expected: ToFrontendPayload<unknown>[] = [{ [frontendId]: { frontendId, msgs: [msg] } }]

    expect(actual).toEqual(expected)
  })
})
