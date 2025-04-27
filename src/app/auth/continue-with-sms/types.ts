import { Iso3166Alpha2Code } from '~/@/country/iso-3166-alpha-2-code'
import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { p } from '~/@/parser'
import { PhoneNumber } from '~/@/phone-number'
import { Remote, Result } from '~/@/result'
import { RPC } from '~/@/rpc'
import { RPCError } from '~/@/rpc/rpc-error'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { BackendCmd } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendEvt } from '~/app/@/backend/evt'
import { UserAccount } from '~/app/@/data/account'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { AppFrontendEvt } from '~/app/@/frontend/evt'
import { IVerifySMS, SendCodeInput, SendCodeOutput, VerifyCodeInput } from '../@/backend/verify-sms'
import { SendCodeProblem } from '../@/backend/verify-sms/send-code-problem'
import { VerifyCodeProblem } from '../@/backend/verify-sms/verify-code-problem'
import { IUserAccountDb } from '../@/user-account-db'
import { IUserSessionDb } from '../@/user-session-db'

export type Sent = Result<RPCError, SendCodeOutput>

const VerifyCodeOutput = Result.parser(VerifyCodeProblem.parser, UserAccount)
export type VerifyCodeOutput = p.Infer<typeof VerifyCodeOutput>
export type Verified = Result<RPCError, VerifyCodeOutput>

export type ModelFrontend = {
  phone: string
  phoneError: TranslatedText | null
  countryCode: Iso3166Alpha2Code
  code: string
  codeError: TranslatedText | null
  sent: Remote | Sent
  verified: Remote | Verified
}

export const toSendErrorMessage = (input: { model: ModelFrontend; ctx: { t: Translator } }): TranslatedText | null => {
  const send = input.model.sent

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
  const verified = input.model.verified

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
  | { t: 'clicked-back-button' }
  | { t: 'inputted-phone-number'; phone: string }
  | { t: 'inputted-country-code'; countryCode: Iso3166Alpha2Code }
  | { t: 'clicked-phone-number-clear' }
  | { t: 'user-clicked-send-code-button' }
  | { t: 'inputted-code'; code: string }
  | { t: 'clicked-code-clear' }
  | { t: 'user-clicked-verify-code-button'; phone: PhoneNumber; code: string }
  | { t: 'sent-code'; sent: Sent }
  | { t: 'verified-code'; verified: Verified }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type BackendCtx = AppBackendCtx & {
  userAccountDb: IUserAccountDb
  userSessionDb: IUserSessionDb
  verifySMS: IVerifySMS
}

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: BaseFrontendCtx & {
    rpc: RPC.Client<typeof rpcContract>
  }
  MsgCmdIn: null
  MsgEvtIn: AppFrontendEvt
  MsgCmdOut: AppFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>
  MsgEvtOut: AppFrontendEvt
}>

export type BackendModule = AppBackendModule<{
  Ctx: BackendCtx
  MsgEvtIn: BackendEvt
  Msg: MsgBackend
  MsgCmdOut: BackendCmd<MsgToFrontend>
  MsgEvtOut: BackendEvt
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
}>

export const rpcContract = RPC.initContract({
  sendCode: {
    input: SendCodeInput,
    output: SendCodeOutput,
  },
  verifyCode: {
    input: VerifyCodeInput,
    output: VerifyCodeOutput,
  },
})
