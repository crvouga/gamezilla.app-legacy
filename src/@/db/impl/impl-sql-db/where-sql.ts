import { Where } from '../../interface/query-input/where'
import { quoteIfKeyword } from './keywords'
import { MappingConfig } from './mapping-config'
import { NULL } from './null'

export const toWhereSql = <TEntity extends Record<string, unknown>, TRow extends Record<string, unknown>>(
  where: Where<TEntity>,
  config: MappingConfig<TEntity, TRow>,
): string => {
  const whereClause = toWhereSqlClause(where, config).trim()
  if (whereClause.length === 0) return ''
  return `WHERE ${whereClause}`
}

const toWhereSqlClause = <TEntity extends Record<string, unknown>, TRow extends Record<string, unknown>>(
  where: Where<TEntity>,
  config: MappingConfig<TEntity, TRow>,
): string => {
  switch (where.op) {
    case 'in': {
      if (where.value.length === 0) return '1=0'
      const sqlColumn = config.mapKeyEntityToSql[where.column]
      if (!sqlColumn) return ''
      return `${quoteIfKeyword(sqlColumn)} IN (${where.value.map((v) => interpolateSqlValue(config.mapValueEntityToSql[where.column](v))).join(',')})`
    }
    case '=': {
      const sqlColumn = config.mapKeyEntityToSql[where.column]
      if (!sqlColumn) return ''
      const sqlValue = interpolateSqlValue(config.mapValueEntityToSql[where.column](where.value))
      if (sqlValue === NULL) return `${quoteIfKeyword(sqlColumn)} IS NULL`
      return `${quoteIfKeyword(sqlColumn)} = ${sqlValue}`
    }
    case 'and': {
      if (where.clauses.length === 0) return ''
      const clauses = where.clauses.map((clause) => toWhereSqlClause(clause, config)).filter((c) => c.length > 0)
      if (clauses.length === 0) return ''
      return clauses.join(' AND ')
    }
  }
}

const interpolateSqlValue = (value: string | number | boolean | null | undefined | symbol): string => {
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
