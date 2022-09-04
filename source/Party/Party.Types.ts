import { Option, pipe, Result, Unit } from "../Core"
import { PartyId, UserId } from "../Data"
import type { DtlsParameters, RtpCapabilities, RtpParameters } from "mediasoup-client/lib/types"
import { removeKey } from "../Core/Record"
import * as mediasoup from "mediasoup"
import { MediaKind } from "mediasoup/node/lib/RtpParameters"


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

export type RouterRtpCapabilities = RtpCapabilities

export type FrontendModel = SharedModel & {
  device: DeviceModel
}

type WorkerModel =
  | { type: "Loading" }
  | { type: "Died", }
  | { type: "Ready", }

type DeviceModel = { type: "Unloaded" } | { type: "Loaded" }


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

export type BackendMsg =
  | ["WorkerCreated"]
  | ["WorkerDied"]
  | ['StartParty.CreateRouterResulted', { result: CreateRouterResult, hostId: UserId.UserId, partyId: PartyId.PartyId }]
  | CreateTransportResulted
  | ProducerTransportConnectDone
  | ProducerTransportProduceDone

export type FrontendMsg =
  | Request
  | ["ClickedBanner"]
  | LoadDeviceResulted
  | UnloadDeviceResulted
  | ProducerTransportConnect
  | ProducerTransportProduce
  | ["ProducerTrackEnded"]
  | ["ProducerTransportClosed"]

export type ToBackend =
  | Request
  | CreateTransport
  | ProducerTransportConnect
  | ProducerTransportProduce

export type ToFrontend = Response | ["Sync", SharedModel] | CreateTransportResulted

//
// Mediasoup Server
//

type CreateRouterProblem = 'worker_does_not_exists'

export type CreateRouterResult = Result.Result<CreateRouterProblem, { routerRtpCapabilities: RouterRtpCapabilities }>

//
// Mediasoup Client
//

export type LoadDeviceResulted = ['LoadDeviceResulted', Result.Result<"device_is_already_loaded" | "failed_to_load_device", Unit>]

export type UnloadDeviceResulted = ['UnloadDeviceResulted', Result.Result<"device_is_already_unloaded" | "failed_to_unload_device", Unit>]

// 
// Mediasoup Client/Server
// 

export type ProducerTransportConnect = ['ProducerTransportConnect', { userId: UserId.UserId, dtlsParameters: DtlsParameters }]

export type ProducerTransportConnectDone = ['ProducerTransportConnectDone',]

export type ProducerTransportProduce = ['ProducerTransportProduce', { userId: UserId.UserId, rtpParameters: RtpParameters, mediaKind: MediaKind, appData: AppData }]

export type ProducerTransportProduceDone = ['ProducerTransportProduceDone',]

type AppData = Record<string, unknown>

export type CreateTransport = ["CreateTransport", { transportVariant: TransportVariant, userId: UserId.UserId; partyId: PartyId.PartyId }]

export type CreateTransportResulted = ["CreateTransportResulted", { transportVariant: TransportVariant, userId: UserId.UserId, partyId: PartyId.PartyId, result: CreateTransportResult }]

export type TransportVariant = "Sender" | "Reciever"

export type TransportOptions = {
  id: string,
  iceParameters: mediasoup.types.IceParameters,
  iceCandidates: mediasoup.types.IceCandidate[],
  dtlsParameters: mediasoup.types.DtlsParameters,
}

export type CreateTransportResult = Result.Result<"router_does_not_exists", { transportOptions: TransportOptions }>

// 
// 
// 
// Request/Response
// 
// 
// 

export type Request = StartParty | LeaveParty | JoinParty

export type Response = StartPartyResulted | LeavePartyResulted | JoinPartyResulted

// 
// 
// 

export type StartParty = ['StartParty', { hostId: UserId.UserId, partyId: PartyId.PartyId }]

export type StartPartyResulted = ['StartPartyResulted', Result.Result<CreateRouterProblem | "already_in_a_party", SharedModel>]

// 
// 
// 

export type LeaveParty = ['LeaveParty', { userId: UserId.UserId, }]

export type LeavePartyResulted = ['LeavePartyResulted', { userId: UserId.UserId, result: Result.Result<"not_in_a_party", SharedModel> }]

export const leaveParty = (
  { userId }: LeaveParty[1],
  model: SharedModel,
): LeavePartyResulted[1] => {
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

export type JoinPartyResulted = ['JoinPartyResulted', Result.Result<"user_already_in_a_party" | "party_does_not_exists", SharedModel>]

export const joinParty = ({ userId, partyId }: JoinParty[1], model: SharedModel): JoinPartyResulted[1] => {

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