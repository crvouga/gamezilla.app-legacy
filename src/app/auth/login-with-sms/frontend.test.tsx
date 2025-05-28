import { describe, expect, it } from 'bun:test'
import { eq } from '~/@/equals/equals'
import { PhoneNumber } from '~/@/phone-number'
import { Err, Ok } from '~/@/result'
import { RPC } from '~/@/wire-rpc'
import type { Screen } from '~/@/screen/generated/screens'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { UserAccount } from '~/app/@/data/user-account'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd'
import type { LoginWithSMSTypes } from '.'
import { FixtureAuthFrontend } from '../@/frontend/fixture'
import { UserSession } from '../@/user-session/user-session'
import { LoginWithSMSFrontend } from './frontend'
import { rpcContract } from './types'

type Msg =
  | {
      msg: LoginWithSMSTypes.MsgFrontend
    }
  | {
      msgBackend: LoginWithSMSTypes.MsgToFrontend
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

  const updates = (init: LoginWithSMSTypes.ModelFrontend, msgs: Msg[]) => {
    const updates: ReturnType<typeof LoginWithSMSFrontend.update>[] = []
    let model = init
    for (const msg of msgs) {
      const updated = LoginWithSMSFrontend.update({
        ctx,
        model,
        ...msg,
      })
      model = updated.model
      updates.push(updated)
    }
    return updates
  }

  const update = (init: LoginWithSMSTypes.ModelFrontend, msgs: Msg[]) => {
    const updates_ = updates(init, msgs)
    return updates_[updates_.length - 1]
  }

  const init = LoginWithSMSFrontend.init

  const render = (model: LoginWithSMSTypes.ModelFrontend = init) => {
    const vDom = <LoginWithSMSFrontend.View ctx={ctx} dispatch={() => {}} model={model} />
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

describe('LoginWithSMSFrontend', () => {
  it('should navigate to verify code screen after code is sent', async () => {
    const f = await Fixture()

    const phoneNumber = PhoneNumber.random()

    const output = f.update(f.init, [{ msg: { t: 'sent-code', sent: Ok(Ok({ phoneNumber })) } }])

    expect(
      PushScreenCmd.did(
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
