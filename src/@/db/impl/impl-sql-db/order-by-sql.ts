import { OrderBy } from '../../interface/query-input/order-by'
import { quoteIfKeyword } from './keywords'
import { MappingConfig } from './mapping-config'

export const toOrderBySql = <TEntity extends Record<string, unknown>, TRow extends Record<string, unknown>>(
  orderBy: OrderBy<TEntity>,
  config: MappingConfig<TEntity, TRow>,
): string => {
  const sql = orderBy
    .flatMap((o): string[] => {
      const sqlColumn = config.mapKeyEntityToSql[o.column]
      if (!sqlColumn) return []
      return [`${quoteIfKeyword(sqlColumn)} ${o.direction.toUpperCase()}`]
    })
    .join(', ')
  return sql ? `ORDER BY ${sql}` : ''
}
