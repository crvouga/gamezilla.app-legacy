import { PackBuilder } from "./builder"
import { PackCreate } from "./create"
import { PackList } from "./list"

//
//
//
// Model
//
//
//

export type ModelClient = PackCreate.ModelClient &
  PackBuilder.ModelClient &
  PackList.ModelClient

export const initClient: ModelClient = {
  ...PackBuilder.initClient,
  ...PackCreate.initClient,
  ...PackList.initClient,
}

export type ModelServer = {}

//
//
//
// Msg
//
//
//

export type MsgClient =
  | PackCreate.MsgClient
  | PackBuilder.MsgClient
  | PackList.MsgClient

export type MsgServer =
  | PackCreate.MsgServer
  | PackBuilder.MsgServer
  | PackList.MsgServer

export type MsgToServer =
  | PackCreate.MsgToServer
  | PackBuilder.MsgToServer
  | PackList.MsgToServer

export type MsgToClient =
  | PackCreate.MsgToClient
  | PackBuilder.MsgToClient
  | PackList.MsgToClient

//
//
//
//
//
//
//

export type MsgGame =
  | PackCreate.MsgGame
  | PackBuilder.MsgGame
  | PackList.MsgGame
