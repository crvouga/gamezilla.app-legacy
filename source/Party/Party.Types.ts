import { PartyId, UserId } from "../Data"

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

export type FrontendModel = { type: "Init" }

type WorkerModel =
  | { type: "Loading" }
  | { type: "Died", }
  | { type: "Ready", }

export type PartyModel = {
  partyId: PartyId.PartyId
  hostId: UserId.UserId
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

export type BackendMsg = ["WorkerReady"] | ["WorkerDied"]

export type FrontendMsg = Request

export type ToBackend = Request

export type ToFrontend = Response

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

export type CreateParty = ['CreateParty', { hostId: UserId.UserId }]

export type CreatePartyResulted = ['CreatePartyResulted',]

