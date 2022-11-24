import { Option, p, Result, Unit } from "../../Core"
import { PartyId, UserId } from "../../Data"
import type {
  DtlsParameters,
  RtpCapabilities as _RtpCapabilities,
  RtpParameters,
} from "mediasoup-client/lib/types"
import { removeKey } from "../../Core/Record"
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
    [partyId: PartyId]: PartyModel
  }
  users: {
    [userId: UserId]: UserModel
  }
}

export type BackendModel = SharedModel & {
  worker: WorkerModel
}

type WorkerModel = { type: "Loading" } | { type: "Died" } | { type: "Ready" }

export type FrontendModel = SharedModel & {
  device: DeviceModel
  mediaStream: MediaStreamModel
  volume: number
  microphonePermissionStatus: MicrophonePermissionStatus
  micData: Uint8Array
}

export type MicrophonePermissionStatus =
  | "Granted"
  | "Denied"
  | "Prompt"
  | "None"

type DeviceModel = { type: "Unloaded" } | { type: "Loaded" }

type MediaStreamModel = { type: "Unloaded" } | { type: "Loaded" }

export type PartyModel = {
  partyId: PartyId
  hostId: UserId
  routerRtpCapabilities: RtpCapabilities
}

export type UserModel = {
  userId: UserId
  partyId: PartyId
  producerId: Option<string>
  deviceRtpCapabilities: Option<RtpCapabilities>
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
  | SendTransport_InitBackend_Done
  | SendTransport_OnConnect_Done
  | SendTransport_OnProduce_Done
  | RecvTransport_InitBackend_Done
  | RecvTransport_OnConnect_Done

export type FrontendMsg =
  | Request
  | ["MicData", { micData: FrontendModel["micData"] }]
  | ["GotVolume", { volume: number }]
  | ["ClickedBanner"]
  | ["GotMicrophonePermissionStatus", MicrophonePermissionStatus]
  | LoadMediaStream_Done
  | UnloadMediaStream_Done
  | LoadDevice_Done
  | UnloadDevice_Done
  | SendTransport_OnConnect
  | SendTransport_OnProduce
  | SendTransport_InitFrontend_Done
  | StartProducing_Done
  | ["EmittedBackendProducerId", { producerId: string }]
  | ["Producer_TrackEnded"]
  | ["Producer_TransportClosed"]
  | RecvTransport_InitFrontend_Done
  | RecvTransport_OnConnect

export type ToBackend =
  | Request
  | SendTransport_InitBackend
  | SendTransport_OnConnect
  | SendTransport_OnProduce
  | RecvTransport_InitBackend
  | RecvTransport_OnConnect
  | LoadDevice_Done

export type ToFrontend =
  | Response
  | ["Sync", SharedModel]
  | SendTransport_InitBackend_Done
  | SendTransport_OnConnect_Done
  | SendTransport_OnProduce_Done
  | RecvTransport_InitBackend_Done
  | RecvTransport_OnConnect_Done

//
//
//
// Mediasoup Msgs
//
//
//

// see /mediasoup-flow-setup-a.png for step in diagram

// Step 0

export type CreateWorker_Done = ["CreateWorker_Done"]
export type WorkerDied = ["WorkerDied"]
export type CreateRouter_Done = [
  "CreateRouter_Done",
  { hostId: UserId; partyId: PartyId },
  Result<"worker_does_not_exists", { routerRtpCapabilities: RtpCapabilities }>,
]

// Step 1

export type LoadMediaStream_Done = [
  "LoadMediaStream_Done",
  { userId: UserId; partyId: PartyId },
  Result<"failed_to_load", Unit>,
]
export type UnloadMediaStream_Done = [
  "UnloadMediaStream_Done",
  Result<"failed_to_unload", Unit>,
]
export type LoadDevice_Done = [
  "LoadDevice_Done",
  { userId: UserId; partyId: PartyId },
  Result<
    "device_is_already_loaded" | "failed_to_load_device",
    {
      deviceRtpCapabilities: RtpCapabilities
    }
  >,
]
export type UnloadDevice_Done = [
  "UnloadDevice_Done",
  Result<"device_is_already_unloaded" | "failed_to_unload_device", Unit>,
]

// Step 2
export type SendTransport_InitBackend = [
  "SendTransport_InitBackend",
  { userId: UserId; partyId: PartyId },
]
export type RecvTransport_InitBackend = [
  "RecvTransport_InitBackend",
  { userId: UserId; partyId: PartyId },
]

// Step 3
export type SendTransport_InitBackend_Done = [
  "SendTransport_InitBackend_Done",
  { userId: UserId; partyId: PartyId },
  Result<"router_does_not_exists", { transportOptions: TransportOptions }>,
]
export type SendTransport_InitFrontend_Done = [
  "SendTransport_InitFrontend_Done",
  Result<
    "device_does_not_exists" | "producer_transport_is_already_initialized",
    Unit
  >,
]
export type RecvTransport_InitBackend_Done = [
  "RecvTransport_InitBackend_Done",
  { userId: UserId; partyId: PartyId },
  Result<
    "router_does_not_exists" | "recv_transport_is_already_initialized",
    { transportOptions: TransportOptions }
  >,
]
export type RecvTransport_InitFrontend_Done = [
  "RecvTransport_InitFrontend_Done",
  Result<
    "device_does_not_exists" | "recv_transport_is_already_initialized",
    Unit
  >,
]

// Step 4

export type StartProducing_Done = [
  "StartProducing_Done",
  Result<
    | "send_transport_does_not_exists"
    | "media_stream_track_does_not_exists"
    | "failed",
    Unit
  >,
]

// Step 5

export type SendTransport_OnConnect = [
  "SendTransport_OnConnect",
  { userId: UserId; dtlsParameters: DtlsParameters },
]
export type SendTransport_OnProduce = [
  "SendTransport_OnProduce",
  {
    userId: UserId
    rtpParameters: RtpParameters
    kind: MediaKind
    appData: AppData
  },
]
export type SendTransport_OnConnect_Done = [
  "SendTransport_OnConnect_Done",
  { userId: UserId },
  Result<
    | "peer_does_not_exists"
    | "peer_missing_producer_transport"
    | "producer_transport_connect_errored",
    Unit
  >,
]
export type SendTransport_OnProduce_Done = [
  "SendTransport_OnProduce_Done",
  { userId: UserId },
  Result<
    | "peer_does_not_exists"
    | "peer_missing_producer_transport"
    | "produce_threw_an_error"
    | "user_does_not_exists",
    { producerId: string }
  >,
]

// Step 6

export type RecvTransport_StartConsuming = ["RecvTransport_StartConsuming"]
export type RecvTransport_StartConsuming_Done = [
  "RecvTransport_StartConsuming_Done",
]

// Step 7
export type StartConsuming_Done = ["StartConsuming_Backend_Done"]
export type RecvTransport_OnConnect = [
  "RecvTransport_OnConnect",
  { userId: UserId; dtlsParameters: DtlsParameters },
]
export type RecvTransport_OnConnect_Done = [
  "RecvTransport_OnConnect_Done",
  { userId: UserId },
  Result<"peer_does_not_exists", Unit>,
]

//
// Payloads
//

export type TransportOptions = {
  transportId: string
  iceParameters: mediasoup.types.IceParameters
  iceCandidates: mediasoup.types.IceCandidate[]
  dtlsParameters: mediasoup.types.DtlsParameters
}

type AppData = Record<string, unknown>

export type RtpCapabilities = _RtpCapabilities

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

export type StartParty = ["StartParty", { hostId: UserId; partyId: PartyId }]

export type StartParty_Done = [
  "StartParty_Done",
  Result<"worker_does_not_exists" | "already_in_a_party", SharedModel>,
]

//
//
//

export type LeaveParty = ["LeaveParty", { userId: UserId }]

export type LeaveParty_Done = [
  "LeaveParty_Done",
  {
    userId: UserId
    result: Result<"not_in_a_party", SharedModel>
  },
]

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
      }),
    }
  }

  const nextHost = p(
    Object.values(model.users),
    (users) =>
      users.filter(
        (user) =>
          user.partyId === party.partyId && user.userId !== party.hostId,
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
      }),
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
    }),
  }
}

//
//
//
//

export type JoinParty = ["JoinParty", { userId: UserId; partyId: PartyId }]

export type JoinParty_Done = [
  "JoinParty_Done",
  Result<"user_already_in_a_party" | "party_does_not_exists", SharedModel>,
]

export const joinParty = (
  { userId, partyId }: JoinParty[1],
  model: SharedModel,
): JoinParty_Done[1] => {
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
        partyId,
      },
    },
  }

  return Result.Ok(modelNew)
}
