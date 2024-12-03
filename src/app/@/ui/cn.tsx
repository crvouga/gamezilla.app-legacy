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
      const filtered = acc
        .filter((a) => toClassPrefix(a) !== toClassPrefix(c))
        .filter((a) => (isSizeClass(a) ? !isSizeClass(c) : true))
      const accNew = [...filtered, c]
      return accNew
    }, [])
    .join(' ')

  return className

  // return twMerge(...classes)
}

const TAILWIND_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl']
const TAILWIND_SIZES_SET = new Set(TAILWIND_SIZES)

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
