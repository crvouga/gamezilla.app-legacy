import { IDbConnSql } from '../db-conn-sql/interface'
import { p } from '../parser'
import { isErr } from '../result'

const MigrationRow = p.obj({
  id: p.str,
  up: p.str,
  down: p.str,
  applied_at: p.str,
  created_at: p.str,
})

export const up = async (input: { dbConnSql: IDbConnSql }) => {
  const queried = await input.dbConnSql.query(
    MigrationRow,
    `SELECT id, up, down, applied_at, created_at FROM migrations WHERE applied_at IS NULL ORDER BY created_at ASC`,
    {},
  )

  if (isErr(queried)) {
    throw new Error('Failed to query migrations')
  }

  for (const row of queried.value) {
    console.log('Applying migration:', row.id)
    await input.dbConnSql.query(p.unknown, row.up, {})
    await input.dbConnSql.query(p.unknown, `UPDATE migrations SET applied_at = NOW() WHERE id = :id`, { id: row.id })
  }
}
