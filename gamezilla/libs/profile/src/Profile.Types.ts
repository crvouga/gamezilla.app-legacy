import { Result } from "@gamezilla/core"
import { UserId, Username } from "@gamezilla/shared"

// 
// 
// 
// Model
// 
// 
// 




export type Profile = {
    userId: UserId
    username: Username
    avatarUrl: string
    themeMode: "Light" | "Dark" | "System"
}

export type FrontendModel = {}

export type BackendModel = {}

// 
// 
// 
// Msg
// 
// 
// 

export type FrontendMsg = Req

export type BackendMsg = ["none"]

export type ToFrontend = Res

export type ToBackend = Req

// 
// 
// Req/Res
// 
// 

export type Req = ['find_many', { userId: UserId[] }]

export type Res = ['find_many_done', { userId: UserId[] }, Result<Problem, Profile[]>]

type Problem = ["database_error", string]

export type Requests = {
    findMany: (userId: UserId[]) => Promise<Result<Problem, Profile[]>>,
    search: (query: string) => Promise<Result<Problem, Profile[]>>,
}

export type RequestMsg = {
    type: keyof Requests,
    parameters: Parameters<Requests[keyof Requests]>
}

export type ResponseMsg = {
    type: keyof Requests,
    parameters: Parameters<Requests[keyof Requests]>
    output: Parameters<Requests[keyof Requests]>
}





