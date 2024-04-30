import { FlowPack } from "../../../@shared/flow-pack/flow-pack"

export type ModelClient = {}

export const initClient: ModelClient = {}

export type MsgClient = {
  t: "pack-list.clicked-pack-item"
  pack: FlowPack
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

export type MsgSync = {
  t: "pack-list.user-clicked-pack-item"
  pack: FlowPack
}
