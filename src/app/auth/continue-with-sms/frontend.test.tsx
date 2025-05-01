import { describe, expect, it } from 'bun:test'
import { eq } from '~/@/equals/equals'
import { PhoneNumber } from '~/@/phone-number'
import { Err, Ok } from '~/@/result'
import { RPC } from '~/@/rpc'
import type { Screen } from '~/@/screen/generated/screens'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { didPushScreen } from '~/app/@/frontend/cmd'
import type { ContinueWithSmsTypes } from '.'
import { FixtureAuthFrontend } from '../@/frontend/fixture'
import { ContinueWithSmsFrontend } from './frontend'
import { rpcContract } from './types'
import { UserAccount } from '~/app/@/data/user-account'
import { UserSession } from '../@/user-session/user-session'
import { SessionId } from '~/@/wire/session-id'

type Msg =
  | {
      msg: ContinueWithSmsTypes.MsgFrontend
    }
  | {
      msgBackend: ContinueWithSmsTypes.MsgToFrontend
    }

const Fixture = async (input?: { currentScreen?: Screen }) => {
  const f = await FixtureAuthFrontend({
    currentScreen: input?.currentScreen ?? { n: 'auth-login', t: 'login-sms-request' },
  })

  const rpcClient = RPC.initClient({
    t: 'local',
    clientSessionId: ClientSessionId.generate(),
    sessionId: SessionId.generate(),
    contract: rpcContract,
    server: {
      async sendCode(input) {
        return Ok(input)
      },
      async verifyCode(input) {
        return Ok({
          phoneNumber: input.phoneNumber,
          userAccount: UserAccount.random(),
          userSession: UserSession.random(),
        })
      },
    },
  })

  const ctx = { ...f.ctx, rpc: rpcClient }

  const updates = (init: ContinueWithSmsTypes.ModelFrontend, msgs: Msg[]) => {
    const updates: ReturnType<typeof ContinueWithSmsFrontend.update>[] = []
    let model = init
    for (const msg of msgs) {
      const updated = ContinueWithSmsFrontend.update({
        ctx,
        model,
        ...msg,
      })
      model = updated.model
      updates.push(updated)
    }
    return updates
  }

  const update = (init: ContinueWithSmsTypes.ModelFrontend, msgs: Msg[]) => {
    const updates_ = updates(init, msgs)
    return updates_[updates_.length - 1]
  }

  const init = ContinueWithSmsFrontend.init

  const render = (model: ContinueWithSmsTypes.ModelFrontend = init) => {
    const vDom = <ContinueWithSmsFrontend.View ctx={ctx} dispatch={() => {}} model={model} />
    const node = f.render(vDom)
    return node
  }

  return {
    ...f,
    init,
    update,
    render,
  }
}

describe('ContinueWithSmsFrontend', () => {
  it('should navigate to verify code screen after code is sent', async () => {
    const f = await Fixture()

    const phoneNumber = PhoneNumber.random()

    const output = f.update(f.init, [{ msg: { t: 'sent-code', sent: Ok(Ok({ phoneNumber })) } }])

    expect(
      didPushScreen(
        output,
        (msg) => msg.n === 'auth-login' && msg.t === 'login-sms-verify' && eq(msg.phoneNumber, phoneNumber),
      ),
    ).toBe(true)
  })

  it('should render error message when send code errors', async () => {
    const f = await Fixture()
    const output = f.update(f.init, [{ msg: { t: 'sent-code', sent: Ok(Err({ t: 'hourly-limit-reached' })) } }])
    const r = f.render(output?.model)
    const alertError = r.getByRole('alert', f.ctx.t('verify-sms-problem.send-code-hourly-limit-reached'))
    expect(alertError).toBeTruthy()
  })

  it('should render error message when verify code errors', async () => {
    const phoneNumber = PhoneNumber.random()
    const f = await Fixture({ currentScreen: { n: 'auth-login', t: 'login-sms-verify', phoneNumber } })
    const output = f.update(f.init, [
      { msg: { t: 'verified-code', verified: Ok(Err({ t: 'verification-already-verified' })) } },
    ])
    const r = f.render(output?.model)
    const alertError = r.getByRole('alert', f.ctx.t('verify-sms-problem.verification-already-verified'))
    expect(alertError).toBeTruthy()
  })

  it('should render code sent to phone number message', async () => {
    const phoneNumber = PhoneNumber.random()
    const f = await Fixture({ currentScreen: { n: 'auth-login', t: 'login-sms-verify', phoneNumber } })
    const r = f.render(f.init)
    const p = r.getByRole('status', f.ctx.t('auth-sms.enter-code-sent-to', PhoneNumber.format(phoneNumber)))
    expect(p).toBeTruthy()
  })
})
