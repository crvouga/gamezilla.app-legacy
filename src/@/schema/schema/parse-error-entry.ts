export type ParseErrorEntry = {
  message: string
  path: string[]
}

const toString = (entry: ParseErrorEntry): string => {
  return `${entry.message} at ${entry.path.join('.')}`
}

export const ParseErrorEntry = {
  toString,
}
