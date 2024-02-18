import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { RemoteResult, Result, notAsked } from "gamezilla/@SHARED/core"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"

//
//
//
//
//

export type ModelClient = {
  packCreateRequest: RemoteResult<string, null>
}

export const initClient: ModelClient = {
  packCreateRequest: notAsked,
}

export type ModelServer = {}

//
//
//
//

export type MsgClient = {
  t: "pack-create.clicked-create-button"
}

export type MsgToServer = { t: "pack-create.clicked-create-button" }

export type MsgServer = {
  t: "noop"
}

export type MsgToClient = {
  t: "pack-create.created-pack"
  created: Result<string, FlowPack>
}

//
//
//
//
//

export type MsgGame = {
  t: "user-created-pack"
  created: Result<string, FlowPack>
  userId: UserId
}
