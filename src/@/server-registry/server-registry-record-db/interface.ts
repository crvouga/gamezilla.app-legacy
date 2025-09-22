import { Result } from '~/@/result'
import { ServerRegistryRecord } from '../server-registry-record'
import { ServerRegistryId } from '../server-registry-record-id'

export type IServerRegistryRecordDb = {
  get(): Promise<Result<string, ServerRegistryRecord>>
  insert(serverRegistryId: ServerRegistryId, serverRegistryRecord: ServerRegistryRecord): Promise<Result<string, null>>
  cleanUp(): Promise<Result<string, null>>
}
