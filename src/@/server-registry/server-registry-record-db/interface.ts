import { Result } from '~/@/result'

import { ServerRegistryRecord } from '../server-registry-record'

export type IServerRegistry = {
  get: () => Promise<Result<string, ServerRegistryRecord>>
  put: (serverRegistryRecord: ServerRegistryRecord) => Promise<Result<string, null>>
}
