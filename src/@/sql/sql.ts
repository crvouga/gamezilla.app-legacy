import { memoize } from '../function/memoize'

export type VarTypePrimitive = number | string | boolean | null | undefined

export type VarTypeJson = {
  t: 'json'
  json: string
}

export const json = <T>(value: T): VarTypeJson => ({
  t: 'json',
  json: JSON.stringify(value),
})

export type VarTypeCommas = {
  t: 'commas'
  values: (string | number)[]
}

export const commas = (values: (string | number)[]): VarTypeCommas => ({
  t: 'commas',
  values,
})

export type VarType = VarTypePrimitive | VarTypeJson | VarTypeCommas

export type Vars = {
  [key: string]: VarType
}

export const pagination = (input: { limit?: number; offset?: number }) => {
  let str = ''

  if (input.limit) {
    str += `LIMIT\t${input.limit}\n`
  }

  if (input.offset) {
    str += `OFFSET\t${input.offset}\n`
  }
  return {
    str,
    vars: {
      limit: input.limit,
      offset: input.offset,
    },
  }
}

export const to = (query: string, variables: Vars): string => {
  const keys = Object.keys(variables)
  keys.sort((a, b) => b.length - a.length)
  let replaced = query
  for (const key of keys) {
    replaced = replaceParam(replaced, key, variables[key])
  }
  return replaced
}

const removeTabs = (str: string) => str.replace(/\t/g, ' ')
const removeNewLines = (str: string) => str.replace(/\n/g, ' ')
const removeMultipleSpaces = (str: string) => str.replace(/ +/g, ' ')
export const clean = (str: string) => removeTabs(removeNewLines(removeMultipleSpaces(str)))

const replaceParam = (query: string, variable: string, value: VarType): string => {
  const replacement = (() => {
    switch (typeof value) {
      case 'number':
      case 'bigint':
      case 'boolean': {
        return `${value}`
      }
      case 'object': {
        switch (value?.t) {
          case 'commas': {
            return value.values
              .map((v) => {
                switch (typeof v) {
                  case 'string': {
                    return `'${v}'`
                  }
                  default: {
                    return `${v}`
                  }
                }
              })
              .join(', ')
          }

          case 'json': {
            const jsonString = value.json
            const escapedJsonString = jsonString.replace(/'/g, "''")
            return `'${escapedJsonString}'`
          }
          default: {
            return 'NULL'
          }
        }
      }
      case 'undefined':
        return 'NULL'
      case 'string': {
        const escapedValue = value.replace(/'/g, "''")
        return `'${escapedValue}'`
      }
      case 'function':
      case 'symbol': {
        return null // Don't replace
      }
      default: {
        return null // Don't replace
      }
    }
  })()

  if (replacement === null) {
    return query
  }

  // Use a more careful replacement that doesn't replace parameters inside quoted strings
  return replaceParamSafely(query, variable, replacement)
}

const replaceParamSafely = (query: string, variable: string, replacement: string): string => {
  const paramPattern = `:${variable}`
  let result = ''
  let inSingleQuotes = false
  let inDoubleQuotes = false
  let i = 0

  while (i < query.length) {
    const char = query[i]

    if (char === "'" && !inDoubleQuotes) {
      // Handle single quotes - check for escaped quotes
      if (i + 1 < query.length && query[i + 1] === "'") {
        // This is an escaped single quote, skip both
        result += "''"
        i += 2
        continue
      }
      inSingleQuotes = !inSingleQuotes
      result += char
      i++
    } else if (char === '"' && !inSingleQuotes) {
      inDoubleQuotes = !inDoubleQuotes
      result += char
      i++
    } else if (!inSingleQuotes && !inDoubleQuotes && query.substring(i, i + paramPattern.length) === paramPattern) {
      // We're not inside quotes and we found the parameter - replace it
      result += replacement
      i += paramPattern.length
    } else {
      result += char
      i++
    }
  }

  return result
}

export const toLog = (query: string, params: Vars): string => {
  const keys = Object.keys(params)
  keys.sort((a, b) => b.length - a.length)
  let replaced = query
  for (const key of keys) {
    replaced = replaceParamLog(replaced, key, params[key])
  }
  return replaced
}

const replaceParamLog = (query: string, key: string, value: VarType): string => {
  switch (typeof value) {
    case 'object': {
      return query
    }
    default: {
      return replaceParam(query, key, value)
    }
  }
}

const MUTATION_PATTERN = /(?:insert\s|update\s|delete\s)/i

export const isMutation = (sql: string) => {
  return MUTATION_PATTERN.test(sql)
}

const VIEW_PATTERN =
  /\b(?:from|join|update|insert\s+into|delete\s+from|replace\s+into|merge\s+into)\s+((?:(?:"[^"]*"|'[^']*'|`[^`]*`|[a-zA-Z0-9_]+)(?:\.[a-zA-Z0-9_]+)?))/gi

export const toViews = (sql: string): string[] => {
  const cleaned = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')

  const seen = new Set<string>()
  const views: string[] = []

  let match
  while ((match = VIEW_PATTERN.exec(cleaned))) {
    let name = match[1]
    if (!name) continue

    name = name.replace(/^["'`]|["'`]$/g, '')
    if (name.includes('.')) {
      name = name.split('.').pop()!
      name = name.replace(/^["'`]|["'`]$/g, '')
    }

    name = name.toLowerCase()
    if (name && !seen.has(name)) {
      seen.add(name)
      views.push(name)
    }
  }
  return views
}

export const toViewsMemoized = memoize({
  toKey: (sql: string) => sql,
  func: toViews,
  cacheCapacity: 1000,
})
