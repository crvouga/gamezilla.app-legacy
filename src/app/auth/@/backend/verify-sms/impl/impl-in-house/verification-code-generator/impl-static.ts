import type { IVerificationCodeGenerator } from './interface'

export const CodeGeneratorFake = ({ code }: { code: string }): IVerificationCodeGenerator => {
  return {
    generate() {
      return code
    },
  }
}
