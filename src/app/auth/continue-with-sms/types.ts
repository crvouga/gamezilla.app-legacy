import { Iso3166Alpha2Code } from '~/@/country/iso-3166-alpha-2-code'
import { TranslatedText } from '~/@/l18n'
import { PhoneNumber } from '~/@/phone-number'
import { Remote, Result } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Posix } from '~/@/time/posix'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { BackendCmd } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendEvt } from '~/app/@/backend/evt'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { AppFrontendEvt } from '~/app/@/frontend/evt'
import { IUserAccountDb } from '../@/backend/user-account-db'
import { IVerifySMS, SendCodeInput, SendCodeOutput, VerifyCodeInput, VerifyCodeOutput } from '../@/backend/verify-sms'

export type ModelFrontend = {
  //
  inputtedPhoneNumber: string
  phoneNumberError: TranslatedText | null
  countryCodeInput: Iso3166Alpha2Code
  //
  inputtedCode: string
  inputtedCodeError: TranslatedText | null
  //
  sentCodeAt: Posix | null
  sendCode: Remote | SendCodeOutput
  //
  verifiedCodeAt: Posix | null
  verified: Remote | VerifyCodeOutput
}

export type MsgFrontend =
  | { t: 'clicked-back-button' }
  | { t: 'inputted-phone-number'; phoneNumber: string }
  | { t: 'inputted-country-code'; countryCode: Iso3166Alpha2Code }
  | { t: 'clicked-phone-number-clear' }
  | { t: 'user-clicked-send-code-button' }
  | { t: 'inputted-code'; inputtedCode: string }
  | { t: 'clicked-code-clear' }
  | {
      t: 'user-clicked-verify-code-button'
      phoneNumber: PhoneNumber
      inputtedCode: string
    }
  | {
      t: 'sent-code'
      sent: Result<string, SendCodeOutput>
    }
  | {
      t: 'verified-code'
      verified: Result<string, VerifyCodeOutput>
    }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type BackendCtx = AppBackendCtx & {
  accountDb: IUserAccountDb
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
