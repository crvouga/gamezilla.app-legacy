import { UserId } from "../Data/UserId";


export type BackendModel = {}

export type FrontendModel =
    | { type: "Loading" }
    | { type: "LoggedOut" }
    | { type: "LoggedIn", currentUserId: UserId }

