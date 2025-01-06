import type { IVerificationCodeGenerator } from './verification-code-generator'

export const VerificationCodeGeneratorReal = (): IVerificationCodeGenerator => {
  return {
    generate() {
      const code = crypto.getRandomValues(new Uint32Array(1))[0]!.toString().slice(0, 6)
      return code
    },
  }
}
