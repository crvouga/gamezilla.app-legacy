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

export const cnLoop = (...classes: ClassNameValue[]): string => {
  let result = ''
  const len = classes.length
  for (let i = 0; i < len; i++) {
    const class_ = classes[i]
    if (class_) {
      result += class_
    }
  }
  return result
}

export const cnFilter = (...classes: ClassNameValue[]): string => {
  return classes.filter(Boolean).join(' ')
}

export const cn = cnFilter
