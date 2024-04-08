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
    case "boolean": {
      return query
        .replace(new RegExp(`:${key}`, "g"), `${value}`)
        .replaceAll(`"`, `'`)
    }
    case "object": {
      if (value === null) {
        return query
          .replace(new RegExp(`:${key}`, "g"), `NULL`)
          .replaceAll(`"`, `'`)
      }

      const jsonString = JSON.stringify(value)

      const escapedJsonString = jsonString.replace(/'/g, "''")

      const replaced = query.replace(
        new RegExp(`:${key}`, "g"),
        `'${escapedJsonString}'`,
      )

      return replaced
    }
    case "undefined": {
      return query
        .replace(new RegExp(`:${key}`, "g"), `NULL`)
        .replaceAll(`"`, `'`)
    }
    case "string": {
      const escapedValue = value.replace(/'/g, "''")

      const replaced = query.replace(
        new RegExp(`:${key}`, "g"),
        `'${escapedValue}'`,
      )
      return replaced
    }

    case "function": {
      return query
    }

    case "symbol": {
      return query
    }
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
