import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"

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

export type MsgGame = {
  t: "noop"
}
