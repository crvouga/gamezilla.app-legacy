import { RequestResponse } from '~/@/request-response/request-response'
import { UserId } from '~/app/@/data/user-id'

export type ModelFrontend = {
  requests: {
    [requestId: string]: RequestResponse<string, UserId>
  }
}
