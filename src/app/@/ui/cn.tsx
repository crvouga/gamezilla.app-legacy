type ClassNameValue = string | null | false | undefined

export type Cn = (...classes: ClassNameValue[]) => string

export const cn: Cn = (...classes) => {
  const result: string[] = []

  for (let i = 0; i < classes.length; i++) {
    const val = classes[i]
    if (val) {
      result.push(val)
      continue
    }
  }

  return result.join(' ')
}
