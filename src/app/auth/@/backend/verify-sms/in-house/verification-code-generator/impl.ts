import type { IVerificationCodeGenerator } from './interface'
import { CodeGeneratorFake as VerificationCodeGeneratorFake } from './impl-static'
import { VerificationCodeGeneratorReal } from './impl-sql'

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
