import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { p } from '~/@/schema'
import { PhoneNumber } from '~/@/phone-number'
import { Result } from '~/@/result'
import { SendCodeProblem } from './send-code-problem'
import { VerifyCodeProblem } from './verify-code-problem'

export const SendCodeInput = p.obj({
  phoneNumber: PhoneNumber,
  preferredLanguage: LanguageCodeISO_639_1.parser,
})
export type SendCodeInput = p.Infer<typeof SendCodeInput>

export const SendCodeOutput = Result.parser(
  SendCodeProblem.parser,
  p.obj({
    phoneNumber: PhoneNumber,
  }),
)
export type SendCodeOutput = p.Infer<typeof SendCodeOutput>

export const VerifyCodeInput = p.obj({
  phoneNumber: PhoneNumber,
  code: p.str,
  preferredLanguage: LanguageCodeISO_639_1.parser,
})
export type VerifyCodeInput = p.Infer<typeof VerifyCodeInput>

export const VerifyCodeOutput = Result.parser(VerifyCodeProblem.parser, p.unknown)
export type VerifyCodeOutput = p.Infer<typeof VerifyCodeOutput>

export type IVerifySMS = {
  sendCode: (input: SendCodeInput) => Promise<SendCodeOutput>
  verifyCode: (input: VerifyCodeInput) => Promise<VerifyCodeOutput>
}
