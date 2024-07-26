import type { IVerificationCodeGenerator } from './verification-code-generator'
import { CodeGeneratorFake as VerificationCodeGeneratorFake } from './verification-code-generator-impl-fake'
import { VerificationCodeGeneratorReal } from './verification-code-generator-impl-real'

export type Impl =
  | {
      t: 'real'
    }
  | {
      t: 'fake'
      code: string
    }

export const VerificationCodeGenerator = (impl: Impl): IVerificationCodeGenerator => {
  switch (impl.t) {
    case 'real': {
      return VerificationCodeGeneratorReal()
    }

    case 'fake': {
      return VerificationCodeGeneratorFake(impl)
    }
  }
}
