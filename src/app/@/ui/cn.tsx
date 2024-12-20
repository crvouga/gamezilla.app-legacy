type ClassNameValue = string | null | false | undefined

export type Cn = (...classes: ClassNameValue[]) => string

export const cn: Cn = (...classes) => {
  let result = ''
  for (const c of classes) {
    if (c) {
      result += (result ? ' ' : '') + c
    }
  }
  return result
}
