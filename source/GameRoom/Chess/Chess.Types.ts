import * as UserVsUser from "./UserVsUser/UserVsUser.Types"
// import * as UserVsBot from "./UserVsBot"

//
//
//
// Model
//
//
//

export type FrontendModel =
  ["UserVsUser", UserVsUser.FrontendModel]

export type BackendModel =
  ["UserVsUser", UserVsUser.BackendModel]


//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["UserVsUser", UserVsUser.FrontendMsg]

export type BackendMsg =
  | ["UserVsUser", UserVsUser.BackendMsg]

export type ToFrontend =
  | ["UserVsUser", UserVsUser.ToFrontend]

export type ToBackend =
  | ["UserVsUser", UserVsUser.ToBackend]

