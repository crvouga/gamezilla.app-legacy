import { Iso3166Alpha2Code } from '~/@/country/iso-3166-alpha-2-code'
import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { s } from '~/@/schema'
import { PhoneNumber } from '~/@/phone-number'
import { Remote, Result } from '~/@/result'
import { RPC } from '~/@/rpc'
import { RPCError } from '~/@/rpc/error'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { UserAccount } from '~/app/@/data/user-account'
import { SendCodeInput, SendCodeOutput, VerifyCodeInput } from '../@/backend/verify-sms'
import { SendCodeProblem } from '../@/backend/verify-sms/send-code-problem'
import { VerifyCodeProblem } from '../@/backend/verify-sms/verify-code-problem'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { UserSession } from '../@/user-session/user-session'

export type Sent = Result<RPCError, SendCodeOutput>

const VerifyCodeOutput = Result.schema(
  VerifyCodeProblem.schema,
  s.obj({ userAccount: UserAccount, userSession: UserSession }),
)
export type VerifyCodeOutput = s.Infer<typeof VerifyCodeOutput>
export type Verified = Result<RPCError, VerifyCodeOutput>

export type ModelFrontend = {
  loginWithSms_phone: string
  loginWithSms_phoneError: TranslatedText | null
  loginWithSms_countryCode: Iso3166Alpha2Code
  loginWithSms_code: string
  loginWithSms_codeError: TranslatedText | null
  loginWithSms_sent: Remote | Sent
  loginWithSms_verified: Remote | Verified
}

export const toSendErrorMessage = (input: { model: ModelFrontend; ctx: { t: Translator } }): TranslatedText | null => {
  const send = input.model.loginWithSms_sent

  if (send.t === 'loading' || send.t === 'not-asked') {
    return null
  }

  if (send.t === 'err') {
    return input.ctx.t('app.something-went-wrong')
  }

  if (send.value.t === 'err') {
    return SendCodeProblem.toString({ problem: send.value.error, t: input.ctx.t })
  }

  return null
}

export const toVerifyErrorMessage = (input: {
  model: ModelFrontend
  ctx: { t: Translator }
}): TranslatedText | null => {
  const verified = input.model.loginWithSms_verified

  if (verified.t === 'loading' || verified.t === 'not-asked') {
    return null
  }

  if (verified.t === 'err') {
    return input.ctx.t('app.something-went-wrong')
  }

  if (verified.value.t === 'err') {
    return VerifyCodeProblem.toString({ problem: verified.value.error, t: input.ctx.t })
  }

  return null
}

export type MsgFrontend =
  | { t: 'loginWithSms_clickedBackButton' }
  | { t: 'loginWithSms_inputtedPhoneNumber'; phone: string }
  | { t: 'loginWithSms_inputtedCountryCode'; countryCode: Iso3166Alpha2Code }
  | { t: 'loginWithSms_clickedPhoneNumberClear' }
  | { t: 'loginWithSms_clickedSendCodeButton' }
  | { t: 'loginWithSms_inputtedCode'; code: string }
  | { t: 'loginWithSms_clickedCodeClear' }
  | { t: 'loginWithSms_clickedVerifyCodeButton'; phone: PhoneNumber; code: string }
  | { t: 'loginWithSms_sentCode'; sent: Sent }
  | { t: 'loginWithSms_verifiedCode'; verified: Verified }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: AuthFrontendCtx & {
    rpc: RPC.Client<typeof rpcContract>
  }
}>

export const rpcContract = RPC.initContract({
  loginWithSms_sendCode: {
    input: SendCodeInput,
    output: SendCodeOutput,
  },
  loginWithSms_verifyCode: {
    input: VerifyCodeInput,
    output: VerifyCodeOutput,
  },
})
