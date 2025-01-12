import { RequestResponse } from '~/@/request-response/request-response'
import type { Result } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'

export type ModelClient = {
  guestRequest: RequestResponse<string, UserId>
}

export type ModelBackend = null

export type MsgClient = { t: 'guest.clicked-continue-as-guest-button' }

export type MsgBackend = { t: null }

export type MsgToBackend = { t: 'guest.clicked-continue-as-guest-button' }

export type MsgToClient = {
  t: 'guest.continue-as-guest-result'
  result: Result<string, UserId>
}
