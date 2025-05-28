import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { s } from '~/@/schema'
import { PhoneNumber } from '~/@/phone-number'
import { Result } from '~/@/result'
import { SendCodeProblem } from './send-code-problem'
import { VerifyCodeProblem } from './verify-code-problem'

export const SendCodeInput = s.obj({
  phoneNumber: PhoneNumber,
  preferredLanguage: LanguageCodeISO_639_1.parser,
})
export type SendCodeInput = s.Infer<typeof SendCodeInput>

export const SendCodeOutput = Result.parser(
  SendCodeProblem.parser,
  s.obj({
    phoneNumber: PhoneNumber,
  }),
)
export type SendCodeOutput = s.Infer<typeof SendCodeOutput>

export const VerifyCodeInput = s.obj({
  phoneNumber: PhoneNumber,
  code: s.str,
  preferredLanguage: LanguageCodeISO_639_1.parser,
})
export type VerifyCodeInput = s.Infer<typeof VerifyCodeInput>

export const VerifyCodeOutput = Result.parser(VerifyCodeProblem.parser, s.unknown)
export type VerifyCodeOutput = s.Infer<typeof VerifyCodeOutput>

export type IVerifySMS = {
  sendCode: (input: SendCodeInput) => Promise<SendCodeOutput>
  verifyCode: (input: VerifyCodeInput) => Promise<VerifyCodeOutput>
}
