export function toSql(query: string, params: { [key: string]: any }): string {
  const keys = Object.keys(params)
  keys.sort((a, b) => b.length - a.length)
  let replaced = query
  for (const key of keys) {
    replaced = replaceParam(replaced, key, params[key])
  }
  return replaced
}

const replaceParam = (query: string, key: string, value: unknown): string => {
  switch (typeof value) {
    case "number":
    case "bigint":
    case "boolean": {
      return query.replace(new RegExp(`:${key}`, "g"), `${value}`)
    }
    case "object": {
      if (value === null) {
        return query.replace(new RegExp(`:${key}`, "g"), `NULL`)
      }
      const jsonString = JSON.stringify(value)
      const escapedJsonString = jsonString.replace(/'/g, "''")

      return query.replace(new RegExp(`:${key}`, "g"), `'${escapedJsonString}'`)
    }
    case "undefined":
      return query.replace(new RegExp(`:${key}`, "g"), `NULL`)
    case "string": {
      const escapedValue = value.replace(/'/g, "''")
      return query.replace(new RegExp(`:${key}`, "g"), `'${escapedValue}'`)
    }
    case "function":
    case "symbol": {
      return query
    }
    default: {
      return query
    }
  }
}

export function toSqlLog(
  query: string,
  params: { [key: string]: any },
): string {
  const keys = Object.keys(params)
  keys.sort((a, b) => b.length - a.length)
  let replaced = query
  for (const key of keys) {
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
