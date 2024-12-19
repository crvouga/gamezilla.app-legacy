type ClassNameValuePrimitive = string | null | undefined | 0 | 0n | false

type ClassNameValue = ClassNameValuePrimitive | ClassNameValuePrimitive[]

export type Cn = (...classes: ClassNameValue[]) => string

export const cn: Cn = (...classes) => {
  const stack = [...classes]
  const result: string[] = []

  for (let i = 0; i < stack.length; i++) {
    const val = stack[i]

    if (!val) {
      continue
    }

    if (!Array.isArray(val)) {
      result.push(val + '')
      continue
    }

    for (let j = 0; j < val.length; j++) {
      const innerVal = val[j]

      if (!innerVal) {
        continue
      }

      result.push(innerVal + '')
    }
  }

  return result.join(' ')
}
