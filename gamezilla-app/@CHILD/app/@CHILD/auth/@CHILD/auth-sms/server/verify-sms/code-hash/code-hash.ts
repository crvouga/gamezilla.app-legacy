import { p } from "gamezilla-app/@SHARED/core/parser"

const parser = p.brand(p.str, "CodeHash")

export type CodeHash = p.Infer<typeof parser>

const hash = (code: string): CodeHash => {
  return code as CodeHash
}

export const CodeHash = {
  ...parser,
  hash,
}
