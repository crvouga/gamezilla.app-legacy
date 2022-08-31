import * as UserVsUser from "./UserVsUser/UserVsUser.Shared"

//
//
//
// Model
//
//
//

export type FrontendModel = {
  type: "UserVsUser"
  child: UserVsUser.FrontendModel
}

export type ModalType = "RequestToDraw" | "AskedToDraw" | "Resign" | "GameOver"

export type BackendModel = {
  type: "UserVsUser"
  child: UserVsUser.BackendModel
}

//
//
//
// Msg
//
//
//

export type FrontendMsg = ["UserVsUser", UserVsUser.FrontendMsg]

export type BackendMsg = ["UserVsUser", UserVsUser.BackendMsg]

export type ToFrontend = ["UserVsUser", UserVsUser.ToFrontend]

export type ToBackend = ["UserVsUser", UserVsUser.ToBackend]
