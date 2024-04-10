import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { RequestResponse, Result } from "gamezilla-app/@SHARED/core"

//
//
//
//

export type ModelClient = {
  guestRequest: RequestResponse<string, UserId>
}

export type ModelServer = null

//
//
//
//

export type MsgClient = { t: "guest.clicked-continue-as-guest-button" }

export type MsgServer = { t: null }

export type MsgToServer = { t: "guest.clicked-continue-as-guest-button" }

export type MsgToClient = {
  t: "guest.continue-as-guest-result"
  result: Result<string, UserId>
}
