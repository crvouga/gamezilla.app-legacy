export function toSql(query: string, params: { [key: string]: any }): string {
  const keys = Object.keys(params);

  const longestToShortest = keys.sort((a, b) => b.length - a.length);

  for (const key of longestToShortest) {
    const value = params[key] ?? undefined;

    switch (typeof value) {
      case "number":
      case "bigint": {
        query = query.replace(new RegExp(`:${key}`, "g"), `${value}`);
        break;
      }
      case "boolean": {
        query = query.replace(new RegExp(`:${key}`, "g"), `${value}`);
        break;
      }
      case "function": {
        break;
      }
      case "object": {
        break;
      }
      case "undefined": {
        query = query.replace(new RegExp(`:${key}`, "g"), `NULL`);
        break;
      }

      case "string": {
        const escapedValue = value.replace(/'/g, "''");
        query = query.replace(new RegExp(`:${key}`, "g"), `'${escapedValue}'`);
        break;
      }

      case "symbol": {
        break;
      }
    }
  }

  query = query.replaceAll(`"`, `'`);

  return query;
}
