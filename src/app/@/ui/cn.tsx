type ClassNameValue = ClassNameArray | string | null | undefined | 0 | 0n | false
type ClassNameArray = ClassNameValue[]

export const cn = (...classes: ClassNameValue[]): string => {
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
const TAILWIND_SIZES_SET = new Set(TAILWIND_SIZES)
const TAILWIND_ALIGNMENT = ['left', 'center', 'right', 'justify']

const isAlignmentClass = (className: string): boolean => {
  return TAILWIND_ALIGNMENT.some((alignment) => className.includes(alignment))
}

const isSizeClass = (className: string): boolean => {
  return TAILWIND_SIZES.some((size) => className.includes(size))
}

const toClassPrefix = (className: string): string => {
  const parts = className.split('-')
  const first = parts[0]?.trim()
  const second = parts[1]?.trim()

  if (second && TAILWIND_SIZES_SET.has(second)) {
    return `${first}-${second}`
  }

  return first ?? ''
}
