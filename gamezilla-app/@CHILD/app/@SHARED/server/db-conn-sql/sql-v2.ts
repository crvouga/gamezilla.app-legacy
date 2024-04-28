type QueryReducerArray = [string, any[], number]
export function queryConvert(parameterizedSql: string, params: Dict<any>) {
  const [text, values] = Object.entries(params).reduce(
    ([sql, array, index], [key, value]) =>
      [
        sql.replace(`:${key}`, `$${index}`),
        [...array, value],
        index + 1,
      ] as QueryReducerArray,
    [parameterizedSql, [], 1] as QueryReducerArray,
  )
  return { text, values }
}
