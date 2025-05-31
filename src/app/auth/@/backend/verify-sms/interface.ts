import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { s } from '~/@/schema'
import { PhoneNumber } from '~/@/phone-number'
import { Result } from '~/@/result'
import { SendCodeProblem } from './send-code-problem'
import { VerifyCodeProblem } from './verify-code-problem'

export const SendCodeInput = s.obj({
  phoneNumber: PhoneNumber,
  preferredLanguage: LanguageCodeISO_639_1.schema,
})
export type SendCodeInput = s.Infer<typeof SendCodeInput>

export const SendCodeOutput = Result.schema(
  SendCodeProblem.schema,
  s.obj({
    phoneNumber: PhoneNumber,
  }),
)
export type SendCodeOutput = s.Infer<typeof SendCodeOutput>

export const VerifyCodeInput = s.obj({
  phoneNumber: PhoneNumber,
  code: s.str(),
  preferredLanguage: LanguageCodeISO_639_1.schema,
})
export type VerifyCodeInput = s.Infer<typeof VerifyCodeInput>

export const VerifyCodeOutput = Result.schema(VerifyCodeProblem.schema, s.unknown)
export type VerifyCodeOutput = s.Infer<typeof VerifyCodeOutput>

export type IVerifySMS = {
  sendCode: (input: SendCodeInput) => Promise<SendCodeOutput>
  verifyCode: (input: VerifyCodeInput) => Promise<VerifyCodeOutput>
}
