import { Result } from '../result'

export type ISqlDbMigration = {
  up: () => Promise<Result<string, null>>
}
