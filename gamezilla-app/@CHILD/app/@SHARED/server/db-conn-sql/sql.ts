export function toSql(query: string, params: { [key: string]: any }): string {
  return Object.keys(params)
    .sort((a, b) => b.length - a.length)
    .reduce((acc, key) => replaceParam(acc, key, params[key]), query)
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

      const escapedJsonString = jsonString.replaceAll(/'/g, '"')

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
      const replaced = query
        .replace(new RegExp(`:${key}`, "g"), `'${escapedValue}'`)
        .replaceAll(`"`, `'`)
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
