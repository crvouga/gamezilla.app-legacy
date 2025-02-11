type ClassNameValue = string | null | false | undefined

export const cnParams = (
  a: ClassNameValue,
  b?: ClassNameValue,
  c?: ClassNameValue,
  d?: ClassNameValue,
  e?: ClassNameValue,
  f?: ClassNameValue,
  g?: ClassNameValue,
) => {
  return (
    (a ? a : '') +
    (b ? ' ' + b : '') +
    (c ? ' ' + c : '') +
    (d ? ' ' + d : '') +
    (e ? ' ' + e : '') +
    (f ? ' ' + f : '') +
    (g ? ' ' + g : '')
  )
}

export const cnLoop = (...classNames: ClassNameValue[]): string => {
  let result = ''
  const len = classNames.length
  for (let i = 0; i < len; i++) {
    const className = classNames[i]
    if (className) {
      result += className
    }
  }
  return result
}

export const cnFilter = (...classNames: ClassNameValue[]): string => {
  return classNames.filter(Boolean).join(' ')
}

export const cn = cnFilter
