export function toSql(query: string, params: { [key: string]: any }): string {
  for (const key in params) {
    const value = params[key].toString().replace(/'/g, "''");
    query = query.replace(new RegExp(`:${key}`, "g"), `'${value}'`);
  }

  query = query.replaceAll(`"`, `'`);

  return query;
}
