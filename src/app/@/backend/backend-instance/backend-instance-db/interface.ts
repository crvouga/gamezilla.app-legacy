import { Result } from '~/@/result'
import { BackendInstance } from '../backend-instance'
import { BackendInstanceId } from '../backend-instance-id'
import { TimeSpan } from '~/@/time/time-span'

export type IBackendInstanceDb = {
  get: (backendId: BackendInstanceId) => Promise<Result<string, BackendInstance | null>>
  put: (backendInstance: BackendInstance) => Promise<Result<string, null>>
  list: () => Promise<Result<string, BackendInstance[]>>
  listAlive: (input: { minimalHeartRate: TimeSpan }) => Promise<Result<string, BackendInstance[]>>
}
