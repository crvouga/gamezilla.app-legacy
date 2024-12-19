type ClassNameValuePrimitive = string | null | undefined | 0 | 0n | false

type ClassNameValue = ClassNameValuePrimitive | ClassNameValuePrimitive[]

export type Cn = (...classes: ClassNameValue[]) => string

export const cnMerge: Cn = (...classes) => {
  const className = classes
    .flatMap((c) => {
      if (typeof c === 'string') {
        return c
          .trim()
          .split(' ')
          .map((c) => c.trim())
          .filter((c) => c.length > 0)
      }
      return []
    })
    .reduce<string[]>((acc, c) => {
      const filtered = acc.filter((a) => {
        if (isSizeClass(a)) {
          return !isSizeClass(c)
        }
        if (isAlignmentClass(a)) {
          return !isAlignmentClass(c)
        }
        if (isAlignmentClass(c)) {
          return !isAlignmentClass(a)
        }

        return toClassPrefix(a) !== toClassPrefix(c)
      })
      filtered.push(c)
      return filtered
    }, [])
    .join(' ')

  return className

  // return twMerge(...classes)
}

const TAILWIND_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl']
const TAILWIND_ALIGNMENT = ['left', 'center', 'right', 'justify']
const TAILWIND_MODIFIERS = [...TAILWIND_SIZES, ...TAILWIND_ALIGNMENT, 'gradient', 'clip']
const TAILWIND_MODIFIERS_SET = new Set(TAILWIND_MODIFIERS)

const isAlignmentClass = (className: string): boolean => {
  return TAILWIND_ALIGNMENT.some((alignment) => className.includes(alignment))
}

const isSizeClass = (className: string): boolean => {
  return TAILWIND_SIZES.some((size) => className.includes(size))
}

const isModifier = (part: string): boolean => {
  return TAILWIND_MODIFIERS_SET.has(part)
}

const toClassPrefix = (className: string): string => {
  const parts = className.split('-')
  const first = parts[0]?.trim()
  const second = parts[1]?.trim()

  if (second && isModifier(second)) {
    return `${first}-${second}`
  }

  return first ?? ''
}
