import mediasoup from "mediasoup"
import { PartyId, UserId } from "../Data"


// 
// 
// 
// Model
// 
// 
// 

export type BackendModel =
  | { type: "WorkerLoading" }
  | { type: "WorkerDied", }
  | { type: "WorkerReady", }

export type Party = {
  partyId: PartyId.PartyId
  hostId: UserId.UserId
}

// 
// 
// 
// Msg
// 
// 
// 

export type BackendMsg = ["WorkerReady"] | ["WorkerDied"]
