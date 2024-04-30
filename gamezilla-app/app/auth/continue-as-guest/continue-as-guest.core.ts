import { RequestResponse, Result } from "gamezilla-app/@SHARED/core"
import { UserId } from "gamezilla-app/app/@SHARED/data"

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
