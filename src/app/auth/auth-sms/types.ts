import { Iso3166Alpha2Code } from '~/@/country/iso-3166-alpha-2-code'
import type { LanguageCodeISO_639_1, TranslatedText } from '~/@/l18n'
import { PhoneNumber } from '~/@/phone-number'
import type { Remote, Result } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { UserAccount } from '~/app/@/data/account'
import { BackendCmd } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendEvt } from '~/app/@/backend/evt'
import { IUserAccountDb } from '../@/backend/user-account-db'
import type { IVerifySMS, SendCodeOutput, VerifyCodeProblem } from './verify-sms'

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
  verifyCode: Remote | VerifyCodeOutput
}

type VerifyCodeOutput = Result<VerifyCodeProblem, UserAccount>

export type MsgFrontend =
  | { t: 'clicked-back-button' }
  | { t: 'inputted-phone-number'; phoneNumber: string }
  | {
      t: 'inputted-country-code'
      countryCode: Iso3166Alpha2Code
    }
  | { t: 'clicked-phone-number-clear' }
  | { t: 'user-clicked-send-code-button' }
  | { t: 'inputted-code'; inputtedCode: string }
  | { t: 'clicked-code-clear' }
  | {
      t: 'user-clicked-verify-code-button'
      phoneNumber: PhoneNumber
      inputtedCode: string
    }
  | { t: 'time-passed'; now: Posix }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend =
  | {
      t: 'user-clicked-send-code-button'
      phoneNumber: PhoneNumber
      preferredLanguage: LanguageCodeISO_639_1
    }
  | {
      t: 'user-clicked-verify-code-button'
      phoneNumber: PhoneNumber
      inputtedCode: string
    }

export type MsgToFrontend =
  | {
      t: 'sent-code'
      phoneNumber: PhoneNumber
      sent: SendCodeOutput
    }
  | {
      t: 'verified-code'
      verified: VerifyCodeOutput
    }

export type BackendModule = AppBackendModule<{
  Ctx: AppBackendCtx
  MsgEvtIn: BackendEvt
  Msg: MsgBackend
  MsgCmdOut: BackendCmd<MsgToFrontend>
  MsgEvtOut: BackendEvt
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Deps: {
    AccountDb: IUserAccountDb
    VerifySMS: IVerifySMS
  }
}>
