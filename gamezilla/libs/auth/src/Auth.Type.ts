import { Result } from "@gamezilla/core";
import { PhoneNumber, SessionId, UserId } from "@gamezilla/shared";


export type FrontendModel = {
  session:
  | { type: "Loading" }
  | { type: "LoggedOut" }
  | { type: "LoggedIn"; currentUserId: UserId }
}

export type BackendModel = {
  sessions: {
    [sessionId: SessionId]: {
      sessionId: SessionId
      userId: UserId
    }
  }

  verifications: {
    [requestId: string]: {
      requestId: string
      phoneNumber: PhoneNumber
      code: number
    }
  }
}



//
//
// Msg
//
//

export type FrontendMsg = Req

export type BackendMsg = ["LoginCodeSent", null]

export type ToBackend = Req

export type ToFrontend = Res

type Req =
  | ["LoginWithCode", { phoneNumber: PhoneNumber }]
  | ["VerifyCode", { phoneNumber: PhoneNumber; code: number }]

type Res =
  | ["LoginWithCode_Done", null]
  | ["VerifyCode_Done", Result<"wrong_code", null>]
