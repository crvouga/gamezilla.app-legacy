import { RequestResponse } from "gamezilla/@SHARED/core"

export type ModelClient = {
  packListRequest: RequestResponse<string, null>
}

export const initClient: ModelClient = {
  packListRequest: RequestResponse.notAsked,
}

export type MsgClient = {
  t: "pack-list.user-observed-end-of-list"
}

export type MsgServer = {
  t: "noop"
}

export type MsgToServer = {
  t: "noop"
}

export type MsgToClient = {
  t: "noop"
}

export type MsgGame = {
  t: "noop"
}
