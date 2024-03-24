import { Uuid } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/core/parser"

const parser = p.brand(p.str, "VerifcationId")

export type VerificationId = p.Infer<typeof parser>

const generate = (): VerificationId => {
  const id = `auth-sms-verification:${Uuid.generate()}`
  if (p.is(parser)(id)) {
    return id
  }
  throw new Error("Failed to generate VerificationId")
}

export const VerificationId = {
  ...parser,
  generate,
}
