export function toSql(query: string, params: { [key: string]: any }): string {
  const keys = Object.keys(params)
  const sortedKeys = keys.sort((a, b) => b.length - a.length)
  let replaced = query
  for (const key of sortedKeys) {
    replaced = replaceParam(replaced, key, params[key])
  }
  return replaced
}

const replaceParam = (query: string, key: string, value: unknown): string => {
  switch (typeof value) {
    case "number":
    case "bigint":
    case "boolean":
      return query.replace(new RegExp(`:${key}`, "g"), `${value}`)
    case "object":
      if (value === null) {
        return query.replace(new RegExp(`:${key}`, "g"), `NULL`)
      }

      const jsonString = JSON.stringify(value)
      // Escapes single quotes in JSON strings by replacing them with two single quotes
      const escapedJsonString = jsonString.replace(/'/g, "''")

      // Replace the placeholder with the correctly escaped JSON string wrapped in single quotes
      return query.replace(new RegExp(`:${key}`, "g"), `'${escapedJsonString}'`)
    case "undefined":
      return query.replace(new RegExp(`:${key}`, "g"), `NULL`)
    case "string":
      // Escapes single quotes in strings by replacing them with two single quotes
      const escapedValue = value.replace(/'/g, "''")
      return query.replace(new RegExp(`:${key}`, "g"), `'${escapedValue}'`)
    case "function":
    case "symbol":
      // Functions and symbols should not be interpolated into SQL queries
      return query
    default:
      return query
  }
}

export function toSqlLog(
  query: string,
  params: { [key: string]: any },
): string {
  const keys = Object.keys(params)
  const sortedKeys = keys.sort((a, b) => b.length - a.length)
  let replaced = query
  for (const key of sortedKeys) {
    replaced = replaceParamLog(replaced, key, params[key])
  }
  return replaced
}

const replaceParamLog = (
  query: string,
  key: string,
  value: unknown,
): string => {
  switch (typeof value) {
    case "object": {
      return query
    }
    default: {
      return replaceParam(query, key, value)
    }
  }
}
