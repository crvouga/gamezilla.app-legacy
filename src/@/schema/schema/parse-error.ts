import { ParseErrorEntry } from './parse-error-entry'

export type ParseError = {
  entries: ParseErrorEntry[]
}

const toString = (error: ParseError): string => {
  return error.entries.map(ParseErrorEntry.toString).join('\n')
}

export const ParseError = {
  toString,
}
