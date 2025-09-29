const POSTGRES_KEYWORDS = ['order', 'type', 'from', 'to']
const isPostgresKeyword = (column: string): boolean => {
  return POSTGRES_KEYWORDS.includes(column)
}
export const quoteIfKeyword = (column: string | number | symbol): string => {
  return typeof column === 'string' && isPostgresKeyword(column) ? `"${column}"` : String(column)
}
