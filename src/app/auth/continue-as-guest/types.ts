import { RequestResponse } from '~/@/request-response/request-response'
import type { Result } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'

export type ModelFrontend = {
  guestRequest: RequestResponse<string, UserId>
}

export type ModelBackend = null

export type MsgFrontend = { t: 'guest.clicked-continue-as-guest-button' }

export type MsgBackend = { t: null }

export type MsgToBackend = { t: 'guest.clicked-continue-as-guest-button' }

export type MsgToFrontend = {
  t: 'guest.continue-as-guest-result'
  result: Result<string, UserId>
}
