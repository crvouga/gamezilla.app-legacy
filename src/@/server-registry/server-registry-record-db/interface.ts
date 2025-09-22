import { Result } from '~/@/result'
import { ServerRegistryRecord } from '../server-registry-record'

export type IServerRegistryRecordDb = {
  get(): Promise<Result<string, ServerRegistryRecord>>
  insert(serverRegistryRecord: ServerRegistryRecord): Promise<Result<string, null>>
  cleanUp(): Promise<Result<string, null>>
}
