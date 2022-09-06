import { Option, pipe, Result, Unit } from "../Core"
import { PartyId, UserId } from "../Data"
import type { DtlsParameters, RtpCapabilities, RtpParameters } from "mediasoup-client/lib/types"
import { removeKey } from "../Core/Record"
import * as mediasoup from "mediasoup"
import { MediaKind } from "mediasoup/node/lib/RtpParameters"

/* 


Mediasoup Group Chat Room Flow

Initial setup

1.) Server create a new router per room
2.) Client creates a new device per room
3.) Client loads routerRtpCapabilities from router into device

Setting up sending data

1.) Server creates one transport then sends


*/





// 
// 
// 
// Model
// 
// 
// 

export type SharedModel = {
  parties: {
    [partyId: PartyId.PartyId]: PartyModel
  }
  users: {
    [userId: UserId.UserId]: UserModel
  }
}

export type BackendModel = SharedModel & {
  worker: WorkerModel
}

type WorkerModel =
  | { type: "Loading" }
  | { type: "Died", }
  | { type: "Ready", }

export type FrontendModel = SharedModel & {
  device: DeviceModel
  mediaStream: MediaStreamModel,
  volume: number
}

type DeviceModel = { type: "Unloaded" } | { type: "Loaded" }

type MediaStreamModel = { type: "Unloaded" } | { type: "Loaded" }

export type PartyModel = {
  partyId: PartyId.PartyId
  hostId: UserId.UserId
  routerRtpCapabilities: RouterRtpCapabilities
}

export type RouterRtpCapabilities = RtpCapabilities

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

export type BackendMsg =
  | WorkerDied
  | CreateWorker_Done
  | CreateRouter_Done
  | Server_InitProducerTransport_Done
  | ProducerTransport_OnConnect_Done
  | ProducerTransport_OnProduce_Done

export type FrontendMsg =
  | Request
  | ["GotVolume", { volume: number }]
  | ["ClickedBanner"]
  | LoadMediaStream_Done
  | UnloadMediaStream_Done
  | LoadDevice_Done
  | UnloadDevice_Done
  | ProducerTransport_OnConnect
  | ProducerTransport_OnProduce
  | Client_InitProducerTransport_Done
  | StartProducerTransport_Done
  | ["EmittedProducerId", { producerId: string }]
  | ["Producer_TrackEnded"]
  | ["Producer_TransportClosed"]

export type ToBackend =
  | Request
  | Server_InitProducerTransport
  | ProducerTransport_OnConnect
  | ProducerTransport_OnProduce

export type ToFrontend =
  | Response
  | ["Sync", SharedModel]
  | Server_InitProducerTransport_Done
  | ProducerTransport_OnConnect_Done
  | ProducerTransport_OnProduce_Done


//
//
//
// Mediasoup Msgs
//
//
//

// server setup
export type CreateWorker_Done = ['CreateWorker_Done']
export type WorkerDied = ['WorkerDied']
export type CreateRouter_Done = ['CreateRouter_Done', { hostId: UserId.UserId, partyId: PartyId.PartyId }, Result.Result<'worker_does_not_exists', { routerRtpCapabilities: RouterRtpCapabilities }>]

// client setup
export type LoadMediaStream_Done = ['LoadMediaStream_Done', { userId: UserId.UserId, partyId: PartyId.PartyId, }, Result.Result<"failed_to_load", Unit>]
export type UnloadMediaStream_Done = ['UnloadMediaStream_Done', Result.Result<"failed_to_unload", Unit>]
export type LoadDevice_Done = ['LoadDevice_Done', { userId: UserId.UserId, partyId: PartyId.PartyId, }, Result.Result<"device_is_already_loaded" | "failed_to_load_device", Unit>]
export type UnloadDevice_Done = ['UnloadDevice_Done', Result.Result<"device_is_already_unloaded" | "failed_to_unload_device", Unit>]

// step 1
export type Server_InitProducerTransport = ["Server_InitProducerTransport", { userId: UserId.UserId, partyId: PartyId.PartyId }]
export type Server_InitProducerTransport_Done = ["Server_InitProducerTransport_Done", { userId: UserId.UserId, partyId: PartyId.PartyId }, Result.Result<"router_does_not_exists", { transportOptions: TransportOptions }>]
export type Client_InitProducerTransport_Done = ["Client_InitProducerTransport_Done", Result.Result<"device_does_not_exists", Unit>]

// step 2
export type ProducerTransport_OnConnect = ["ProducerTransport_OnConnect", { userId: UserId.UserId, dtlsParameters: DtlsParameters }]
export type ProducerTransport_OnProduce = ["ProducerTransport_OnProduce", { userId: UserId.UserId, rtpParameters: RtpParameters, kind: MediaKind, appData: AppData }]
export type ProducerTransport_OnConnect_Done = ["ProducerTransport_OnConnect_Done", { userId: UserId.UserId }, Result.Result<"peer_does_not_exists" | "peer_missing_send_transport", Unit>]
export type ProducerTransport_OnProduce_Done = ["ProducerTransport_OnProduce_Done", { userId: UserId.UserId }, Result.Result<"peer_does_not_exists" | "peer_missing_send_transport", { producerId: string }>]

export type StartProducerTransport_Done = ['StartProducerTransport_Done', Result.Result<"producer_transport_does_not_exists" | "media_stream_track_does_not_exists" | "failed", Unit>]

// 
// Payloads
// 

export type TransportOptions = {
  transportId: string,
  iceParameters: mediasoup.types.IceParameters,
  iceCandidates: mediasoup.types.IceCandidate[],
  dtlsParameters: mediasoup.types.DtlsParameters,
}

type AppData = Record<string, unknown>

// 
// 
// 
// Request/Response
// 
// 
// 

export type Request = StartParty | LeaveParty | JoinParty

export type Response = StartParty_Done | LeaveParty_Done | JoinParty_Done

// 
// 
// 

export type StartParty = ['StartParty', { hostId: UserId.UserId, partyId: PartyId.PartyId }]

export type StartParty_Done = ['StartParty_Done', Result.Result<"worker_does_not_exists" | "already_in_a_party", SharedModel>]

// 
// 
// 

export type LeaveParty = ['LeaveParty', { userId: UserId.UserId, }]

export type LeaveParty_Done = ['LeaveParty_Done', { userId: UserId.UserId, result: Result.Result<"not_in_a_party", SharedModel> }]

export const leaveParty = (
  { userId }: LeaveParty[1],
  model: SharedModel,
): LeaveParty_Done[1] => {
  const user = model.users[userId]

  if (!user) {
    return { userId, result: Result.Err("not_in_a_party") }
  }

  const party = model.parties[user.partyId]

  if (!party) {
    return { userId, result: Result.Err("not_in_a_party") }
  }

  const usersNew = removeKey(userId, model.users)

  if (user.userId !== party.hostId) {
    return {
      userId,
      result: Result.Ok({
        ...model,
        users: usersNew,
        parties: {
          ...model.parties,
          [party.partyId]: party,
        },
      })
    }
  }

  const nextHost = pipe(
    Object.values(model.users),
    (users) =>
      users.filter(
        (user) => user.partyId === party.partyId && user.userId !== party.hostId,
      ),
    (users) => users[0],
  )

  if (!nextHost) {
    return {
      userId,
      result: Result.Ok({
        ...model,
        users: usersNew,
        parties: removeKey(party.partyId, model.parties),
      })
    }
  }

  const partiesNew: SharedModel["parties"] = {
    ...model.parties,
    [party.partyId]: {
      ...party,
      hostId: nextHost.userId,
    },
  }

  return {
    userId,
    result: Result.Ok({
      ...model,
      users: usersNew,
      parties: partiesNew,
    })
  }
}

// 
// 
// 
// 

export type JoinParty = ['JoinParty', { userId: UserId.UserId, partyId: PartyId.PartyId }]

export type JoinParty_Done = ['JoinParty_Done', Result.Result<"user_already_in_a_party" | "party_does_not_exists", SharedModel>]

export const joinParty = ({ userId, partyId }: JoinParty[1], model: SharedModel): JoinParty_Done[1] => {

  const user = model.users[userId]

  if (user) {
    return Result.Err("user_already_in_a_party")
  }

  const party = model.parties[partyId]

  if (!party) {
    return Result.Err("party_does_not_exists")
  }

  const modelNew: SharedModel = {
    ...model,
    users: {
      ...model.users,
      [userId]: {
        userId,
        partyId
      }
    }
  }

  return Result.Ok(modelNew)
}