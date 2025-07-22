import { ImplDbMate } from './impl-dbmate'
import { ISqlDbMigration } from './interface'

export type SqlDbMigration = ImplDbMate

const init = (config: ImplDbMate): ISqlDbMigration => {
  switch (config.t) {
    case 'dbmate':
      return ImplDbMate.init(config)
  }
}

export const SqlDbMigration = {
  init,
}
