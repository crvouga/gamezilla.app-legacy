import { Query, QueryResult, Where, WhereClause, WhereOperator, WhereValue } from './query'

export type Model<TRow> = {
  rows: {
    [id: string]: TRow
  }
}

export type Config<TRow> = {
  toId: (row: TRow) => string
}

export const init = <TRow>(_rows: TRow[]): Model<TRow> => {
  return {
    rows: {}
  }
}

const filter = <TRow>(rows: TRow[], whereClause: WhereClause<TRow>): TRow[] => {
  const [operator, key, value] = whereClause

  switch (operator) {
    case '!=': {
      return rows.filter((row) => row[key] !== value)
    }

    case '>': {
      return rows.filter((row) => row[key] > value)
    }

    case '<': {
      return rows.filter((row) => row[key] < value)
    }

    case '<=': {
      return rows.filter((row) => row[key] <= value)
    }

    case '=': {
      return rows.filter((row) => row[key] === value)
    }

    case '>=': {
      return rows.filter((row) => row[key] >= value)
    }

    case 'all': {
      return rows.filter((row) => row[key] === value)
    }

    default: {
      return rows
    }
  }
}

const and = <TRow>(rows: TRow[], whereClauses: WhereClause<TRow>[]): TRow[] => {
  const [first, ...rest] = whereClauses

  if (!first) {
    return rows
  }
}

export const query = <TRow>(map: Model<TRow>, query: Query<TRow>): QueryResult<TRow> => {
  const filtered = Object.values(map.rows).filter((row) => true)

  const [first, ...rest] = query.where

  return {
    limit: query.limit,
    offset: query.offset,
    rows: [],
    total: filtered.length
  }
}

export const insert = <TRow>(config: Config<TRow>, map: Model<TRow>, rows: TRow[]): Model<TRow> => {
  const newMap = { ...map }

  for (const row of rows) {
    newMap.rows[config.toId(row)] = row
  }

  return newMap
}
