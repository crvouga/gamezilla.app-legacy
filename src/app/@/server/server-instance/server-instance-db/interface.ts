import { Result } from '~/@/result'
import { BackendInstance } from '../server-instance'
import { BackendInstanceId } from '../server-instance-id'
import { TimeSpan } from '~/@/time/time-span'

export type IBackendInstanceDb = {
  get: (serverId: BackendInstanceId) => Promise<Result<string, BackendInstance | null>>
  put: (serverInstance: BackendInstance) => Promise<Result<string, null>>
  list: () => Promise<Result<string, BackendInstance[]>>
  listAlive: (input: { minimalHeartRate: TimeSpan }) => Promise<Result<string, BackendInstance[]>>
}
