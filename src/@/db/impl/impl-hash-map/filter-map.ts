import { Where } from '../../interface/query-input/where'
import { Indexes } from './indexes'

export const filterMap = <TEntity extends Record<string, unknown>>(
  entities: Map<TEntity[keyof TEntity], TEntity>,
  indexes: Indexes<TEntity>,
  where: Where<TEntity>,
): Map<TEntity[keyof TEntity], TEntity> => {
  switch (where.op) {
    case 'in': {
      const result = new Map<TEntity[keyof TEntity], TEntity>()
      const columnIndex = indexes.get(String(where.column))

      if (!columnIndex) return result

      const pksMatchingCriteria = new Set<TEntity[keyof TEntity]>()
      for (const value of where.value) {
        const pksForValue = columnIndex.get(value)
        if (!pksForValue) continue
        for (const pk of pksForValue) {
          pksMatchingCriteria.add(pk)
        }
      }

      for (const pk of pksMatchingCriteria) {
        if (!entities.has(pk)) continue
        const entity = entities.get(pk)!
        result.set(pk, entity)
      }
      return result
    }
    case '=': {
      const result = new Map<TEntity[keyof TEntity], TEntity>()
      const columnIndex = indexes.get(where.column)

      if (!columnIndex) return result

      const pksMatchingValue = columnIndex.get(where.value)

      if (!pksMatchingValue) return result

      for (const pk of pksMatchingValue) {
        if (!entities.has(pk)) continue
        const entity = entities.get(pk)!
        result.set(pk, entity)
      }
      return result
    }
    case 'and': {
      let accMap = entities
      for (const clause of where.clauses) {
        accMap = filterMap(accMap, indexes, clause)
      }
      return accMap
    }
  }
}
