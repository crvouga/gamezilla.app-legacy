import { Option, Result } from "../Core"
import { PartyId, UserId } from "../Data"
import type { RtpCapabilities } from "mediasoup-client/lib/types"

// 
// 
// 
// Model
// 
// 
// 

export type BackendModel = {
  worker: WorkerModel
  parties: {
    [partyId: PartyId.PartyId]: PartyModel
  }
  users: {
    [userId: UserId.UserId]: UserModel
  }
}

export type RouterRtpCapabilities = RtpCapabilities

export type FrontendModel =
  | {
    type: "NotInParty"
  }
  | ({
    type: "InParty",
  } & PartyModel)

type WorkerModel =
  | { type: "Loading" }
  | { type: "Died", }
  | { type: "Ready", }

export type PartyModel = {
  partyId: PartyId.PartyId
  hostId: UserId.UserId
  routerRtpCapabilities: RouterRtpCapabilities
}

export type UserModel = {
  userId: UserId.UserId,
  partyId: PartyId.PartyId
}

// 
// 
// 
// Msg
// 
// 
// 

export type BackendMsg = ["WorkerCreated"] | ["WorkerDied"] | ['CreateParty.CreateRouterResulted', { result: CreateRouterResult, hostId: UserId.UserId, partyId: PartyId.PartyId }]

type CreateRouterProblem = 'worker_does_not_exists'

export type CreateRouterResult = Result.Result<CreateRouterProblem, { routerRtpCapabilities: RouterRtpCapabilities }>

export type FrontendMsg = Request

export type ToBackend = Request

export type ToFrontend = Response | ["Sync", FrontendModel]

// 
// 
// 
// Request/Response
// 
// 
// 

export type Request = CreateParty

export type Response = CreatePartyResulted

// 
// 
// 

export type CreateParty = ['CreateParty', { hostId: UserId.UserId, partyId: PartyId.PartyId }]

export type CreatePartyResulted = ['CreatePartyResulted', Result.Result<CreateRouterProblem, PartyModel>]

