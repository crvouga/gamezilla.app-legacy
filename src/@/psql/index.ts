import { unwrap } from '~/@/result'
import { s } from '../schema'
import { ISqlDb } from '../sql-db/interface'
import { PsqlSummary } from './summary'
import { Command } from './types'

const SQL_TABLE_INFO = `
SELECT 
  t.tablename,
  string_agg(c.column_name, ',' ORDER BY c.ordinal_position) as columns
FROM pg_catalog.pg_tables t
LEFT JOIN information_schema.columns c 
  ON c.table_name = t.tablename
WHERE schemaname = 'public'
GROUP BY t.tablename
`

const SQL_TABLE_INFO_BY_SCHEMA = `
SELECT 
  t.tablename,
  string_agg(c.column_name, ',' ORDER BY c.ordinal_position) as columns
FROM pg_catalog.pg_tables t
LEFT JOIN information_schema.columns c 
  ON c.table_name = t.tablename
WHERE schemaname = $1
GROUP BY t.tablename
`

export const Psql = (config: { sqlDb: ISqlDb }) => {
  const commands: Command[] = []

  if (true)
    commands.push({
      description: 'List all tables',
      match: /dt/,
      handler: async (_strings: TemplateStringsArray, ..._values: any[]) => {
        const result = await config.sqlDb.query({
          sql: SQL_TABLE_INFO,
          schema: s.unknown,
          vars: {},
        })
        const rows = unwrap(result)
        console.table(rows)
      },
    })

  if (true)
    commands.push({
      description: 'Describe a table',
      match: /d\s+\w+/,
      handler: async (strings: TemplateStringsArray, ..._values: any[]) => {
        const tableName = strings[0]?.trim().replaceAll('  ', ' ').split(' ')?.[1]
        if (!tableName) {
          console.error('No table name provided')
          return
        }

        const result = await config.sqlDb.query({
          sql: SQL_TABLE_INFO_BY_SCHEMA,
          schema: s.unknown,
          vars: { schema: tableName },
        })

        const rows = unwrap(result)
        console.table(rows)
      },
    })

  if (true)
    commands.push({
      description: 'help',
      match: /^(help|h)$/,
      handler: async (_strings: TemplateStringsArray, ..._values: any[]) => {
        console.table(commands.map((c) => [c.match.source, c.description]))
      },
    })

  if (true) PsqlSummary.register({ commands, sqlDb: config.sqlDb })

  if (true)
    commands.push({
      description: 'Execute a raw SQL query',
      match: /.*/,
      handler: async (strings: TemplateStringsArray, ...values: any[]) => {
        const sql = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '')

        const result = await config.sqlDb.query({ schema: s.unknown, sql, vars: {} })
        const rows = unwrap(result)
        if (rows.length === 0) {
          console.log('No rows returned')
          return
        }
        // console.clear()
        console.table(rows)
      },
    })

  return {
    psql: async (strings: TemplateStringsArray, ...values: any[]) => {
      const cmd = strings[0]?.trim().toLowerCase()
      if (!cmd) {
        console.error('No command provided')
        return
      }

      const command = commands.find((c) => c.match.test(cmd))

      if (!command) {
        console.error('Unknown command')
        return
      }

      await command.handler(strings, ...values)
    },
  }
}
