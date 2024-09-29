type ClassNameValue = ClassNameArray | string | null | undefined | 0 | 0n | false
type ClassNameArray = ClassNameValue[]

export const cn = (...classes: ClassNameValue[]): string => {
  const classList: string[] = []
  for (const className of classes) {
    if (!className) {
      continue
    }

    if (Array.isArray(className)) {
      classList.push(cn(...className))
      continue
    }

    classList.push(className.trim())
  }
  return classList.join(' ')
}
