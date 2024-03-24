import { ICodeGenerator } from "./code-generator"

export const CodeGeneratorFake = ({
  code,
}: {
  code: string
}): ICodeGenerator => {
  return {
    generate() {
      return code
    },
  }
}
