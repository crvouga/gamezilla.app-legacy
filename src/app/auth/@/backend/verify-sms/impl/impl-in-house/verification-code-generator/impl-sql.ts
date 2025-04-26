import type { IVerificationCodeGenerator } from './interface'

export const VerificationCodeGeneratorReal = (): IVerificationCodeGenerator => {
  return {
    generate() {
      const code = crypto.getRandomValues(new Uint32Array(1))[0]!.toString().slice(0, 6)
      return code
    },
  }
}
