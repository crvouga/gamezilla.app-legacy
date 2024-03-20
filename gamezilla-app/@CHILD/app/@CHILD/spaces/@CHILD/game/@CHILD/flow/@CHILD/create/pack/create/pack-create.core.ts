import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { RemoteResult, Result, notAsked } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/parsing"
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

export const isMsgSync = p.obj({
  t: p.l("user-created-pack"),
  created: Result.is(p.str, FlowPack.is),
  userId: UserId.is,
})

export type MsgSync = p.Infer<typeof isMsgSync>
