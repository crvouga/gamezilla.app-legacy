import { Where } from '../../interface/query-input/where'
import { NULL } from './null'
import { quoteIfKeyword } from './keywords'

export const toWhereSql = <TEntity extends Record<string, unknown>>(
  where: Where<TEntity>,
  columnToSqlColumn: (column: keyof TEntity) => string | number | symbol | null,
): string => {
  const whereClause = toWhereSqlClause(where, columnToSqlColumn).trim()
  if (whereClause.length === 0) return ''
  return `WHERE ${whereClause}`
}

const toWhereSqlClause = <TEntity extends Record<string, unknown>>(
  where: Where<TEntity>,
  columnToSqlColumn: (column: keyof TEntity) => string | number | symbol | null,
): string => {
  switch (where.op) {
    case 'in': {
      if (where.value.length === 0) return ''
      const sqlColumn = columnToSqlColumn(where.column)
      if (!sqlColumn) return ''
      return `${quoteIfKeyword(sqlColumn)} IN (${where.value.map((v) => interpolateSqlValue(v)).join(',')})`
    }
    case '=': {
      const sqlColumn = columnToSqlColumn(where.column)
      if (!sqlColumn) return ''
      const sqlValue = interpolateSqlValue(where.value)
      if (sqlValue === NULL) return `${quoteIfKeyword(sqlColumn)} IS NULL`
      return `${quoteIfKeyword(sqlColumn)} = ${sqlValue}`
    }
    case 'and': {
      if (where.clauses.length === 0) return ''
      return `${where.clauses.map((clause) => toWhereSqlClause(clause, columnToSqlColumn)).join(' AND ')}`
    }
  }
}

const interpolateSqlValue = (value: unknown) => {
  switch (typeof value) {
    case 'string':
      return `'${value}'`
    case 'bigint':
    case 'number':
      return `${value}`
    case 'boolean':
      if (value) return 'TRUE'
      return 'FALSE'
    case 'undefined':
      return NULL
    case 'object':
      if (value === null) return NULL
      return NULL
    case 'function':
    case 'symbol':
      return NULL
    default:
      return `${value}`
  }
}
