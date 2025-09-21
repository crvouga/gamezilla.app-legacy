import { Result } from '~/@/result'

import { ServerRegistryRecord } from '../server-registry-record'

export type IGetServerRegistry = () => Promise<Result<string, ServerRegistryRecord>>
export type IPutServerRegistry = (serverRegistryRecord: ServerRegistryRecord) => Promise<Result<string, null>>

export type IServerRegistry = {
  get: IGetServerRegistry
  put: IPutServerRegistry
}
