import * as mediasoup from "mediasoup"
import * as Rx from "rxjs"
import { Cmd, exhaustive, Option, p, Result, Task, Unit } from "../Core"
import { PartyId, UserId } from "../Data"
import { Config } from "./Config"
import {
  BackendModel,
  BackendMsg,
  CreateRouter_Done,
  joinParty,
  leaveParty,
  PartyModel,
  RecvTransport_InitBackend,
  RecvTransport_InitBackend_Done,
  SendTransport_InitBackend,
  SendTransport_InitBackend_Done,
  SendTransport_OnConnect,
  SendTransport_OnConnect_Done,
  SendTransport_OnProduce,
  SendTransport_OnProduce_Done,
  ToBackend,
  ToFrontend,
  TransportOptions,
  UserModel,
} from "./Party.Types"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init = (): [Model, Cmd.Cmd<Msg>] => [
  {
    worker: { type: "Loading" },
    parties: {},
    users: {},
  },
  p(
    initWorker,
    Cmd.perform(() => ["CreateWorker_Done"]),
  ),
]

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (
  {
    sendToUser,
    broadcast,
  }: {
    sendToUser: (userIds: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<never>
    broadcast: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const sendToParty = (
    partyId: PartyId.PartyId,
    msg: ToFrontend,
  ): Cmd.Cmd<never> => {
    const userIds = Object.values(model.users).flatMap((user) =>
      user.partyId === partyId ? [user.userId] : [],
    )
    return sendToUser(userIds, msg)
  }

  switch (msg[0]) {
    case "CreateWorker_Done": {
      return [{ ...model, worker: { type: "Ready" } }, Cmd.None]
    }

    case "WorkerDied": {
      return [{ ...model, worker: { type: "Died" } }, Cmd.None]
    }

    case "RecvTransport_InitBackend_Done": {
      const { userId } = msg[1]

      return [model, sendToUser([userId], msg)]
    }

    case "SendTransport_InitBackend_Done": {
      const { userId } = msg[1]

      return [model, sendToUser([userId], msg)]
    }

    case "SendTransport_OnConnect_Done": {
      const { userId } = msg[1]

      return [model, sendToUser([userId], msg)]
    }

    case "SendTransport_OnProduce_Done": {
      const { userId } = msg[1]

      const result = msg[2]

      if (result.type === "Err") {
        return [model, sendToUser([userId], msg)]
      }

      const producingUser = model.users[userId]

      if (!producingUser) {
        return [model, sendToUser([userId], msg)]
      }

      const { producerId } = result.value

      const modelNew: Model = {
        ...model,
        users: {
          ...model.users,
          [userId]: {
            ...producingUser,
            producerId: Option.Some(producerId),
          },
        },
      }

      // const otherUsers = Object.values(model.users).map(
      //   (user) =>
      //     user.partyId === producingUser.partyId &&
      //     user.userId !== producingUser.userId,
      // )
      //

      const cmd = Cmd.batch([
        sendToParty(producingUser.partyId, ["Sync", modelNew]),
        sendToUser([userId], msg),
      ])

      return [modelNew, cmd]
    }

    case "RecvTransport_OnConnect_Done": {
      return [model, Cmd.None]
    }

    case "CreateRouter_Done": {
      const { partyId, hostId } = msg[1]
      const result = msg[2]

      if (result.type === "Err") {
        return [model, sendToUser([hostId], ["StartParty_Done", result])]
      }

      const { routerRtpCapabilities } = result.value

      const user = model.users[hostId]

      if (user) {
        return [
          model,
          sendToUser(
            [hostId],
            ["StartParty_Done", Result.Err("already_in_a_party")],
          ),
        ]
      }

      const partyNew: PartyModel = {
        partyId,
        routerRtpCapabilities,
        hostId,
      }

      const userNew: UserModel = {
        partyId,
        userId: hostId,
        producerId: Option.None,
        deviceRtpCapabilities: Option.None,
      }

      const modelNew: Model = {
        ...model,
        parties: {
          ...model.parties,
          [partyNew.partyId]: partyNew,
        },
        users: {
          ...model.users,
          [userNew.userId]: userNew,
        },
      }

      return [
        modelNew,
        Cmd.batch([
          broadcast(["Sync", modelNew]),
          sendToUser([hostId], ["StartParty_Done", Result.Ok(modelNew)]),
        ]),
      ]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromFrontend = (
  {
    broadcast,
    sendToUser,
  }: {
    broadcast: (msg: ToFrontend) => Cmd.Cmd<Msg>
    sendToUser: (userId: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const sendToParty = (
    partyId: PartyId.PartyId,
    msg: ToFrontend,
  ): Cmd.Cmd<never> => {
    const userIds = Object.values(model.users).flatMap((user) =>
      user.partyId === partyId ? [user.userId] : [],
    )
    return sendToUser(userIds, msg)
  }

  switch (msg[0]) {
    case "RecvTransport_InitBackend": {
      return [
        model,
        p(
          initRecvTransport(msg[1]),
          Cmd.perform(
            (result): Msg => ["RecvTransport_InitBackend_Done", msg[1], result],
          ),
        ),
      ]
    }

    case "SendTransport_InitBackend": {
      return [
        model,
        p(
          initSendTransport(msg[1]),
          Cmd.perform(
            (result): Msg => ["SendTransport_InitBackend_Done", msg[1], result],
          ),
        ),
      ]
    }

    case "SendTransport_OnConnect": {
      return [
        model,
        p(
          handleSendTransport_OnConnect(msg[1]),
          Cmd.perform(
            (result): Msg => [
              "SendTransport_OnConnect_Done",
              { userId: msg[1].userId },
              result,
            ],
          ),
        ),
      ]
    }

    case "SendTransport_OnProduce": {
      return [
        model,
        p(
          handleSendTransport_OnProduce(model, msg[1]),
          Cmd.perform(
            (result): Msg => [
              "SendTransport_OnProduce_Done",
              { userId: msg[1].userId },
              result,
            ],
          ),
        ),
      ]
    }

    case "StartParty": {
      const partyId = msg[1].partyId
      const hostId = msg[1].hostId
      return [
        model,
        p(
          initRouter(partyId),
          Cmd.perform(
            (result): Msg => ["CreateRouter_Done", { hostId, partyId }, result],
          ),
        ),
      ]
    }

    case "LeaveParty": {
      const { userId } = msg[1]

      const result = leaveParty(msg[1], model)

      if (result.result.type === "Err") {
        return [
          model,
          Cmd.batch([
            sendToUser([userId], ["Sync", model]),
            sendToUser([userId], ["LeaveParty_Done", result]),
          ]),
        ]
      }

      const sharedModelNew = result.result.value

      const user = model.users[result.userId]

      const cmd = user
        ? Cmd.batch([
          broadcast(["Sync", sharedModelNew]),
          sendToParty(user.partyId, [
            "LeaveParty_Done",
            { userId, result: Result.Ok(sharedModelNew) },
          ]),
        ])
        : broadcast(["Sync", sharedModelNew])

      return [
        {
          ...model,
          parties: sharedModelNew.parties,
          users: sharedModelNew.users,
        },
        cmd,
      ]
    }

    case "JoinParty": {
      const { userId, partyId } = msg[1]

      const result = joinParty(msg[1], model)

      if (result.type === "Err") {
        return [
          model,
          Cmd.batch([
            sendToUser([userId], ["Sync", model]),
            sendToUser([userId], ["JoinParty_Done", result]),
          ]),
        ]
      }

      const sharedModelNew = result.value

      const modelNew: Model = {
        ...model,
        parties: sharedModelNew.parties,
        users: sharedModelNew.users,
      }

      return [
        modelNew,
        Cmd.batch([
          broadcast(["Sync", modelNew]),
          sendToParty(partyId, ["JoinParty_Done", result]),
        ]),
      ]
    }

    case "RecvTransport_OnConnect": {
      return [model, Cmd.None]
    }

    case "LoadDevice_Done": {
      const { userId } = msg[1]

      const result = msg[2]

      if (result.type === "Err") {
        return [model, Cmd.None]
      }

      const user = model.users[userId]

      if (!user) {
        return [model, Cmd.None]
      }

      const { deviceRtpCapabilities } = result.value

      const modelNew: Model = {
        ...model,
        users: {
          ...model.users,
          [userId]: {
            ...user,
            deviceRtpCapabilities: Option.Some(deviceRtpCapabilities),
          },
        },
      }

      return [modelNew, sendToParty(user.partyId, ["Sync", modelNew])]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model) => {
  return mediasoupMsgs
}

//
//
//
//
//
//

export const onClientConnected = (
  {
    sendToUser,
  }: {
    sendToUser: (userIds: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<Msg>
  },
  maybeUserId: Option.Option<UserId.UserId>,
  model: Model,
): Cmd.Cmd<Msg> => {
  if (maybeUserId.type === "None") {
    return Cmd.None
  }

  const userId = maybeUserId.value

  return sendToUser([userId], ["Sync", model])
}

//
//
//
//
// Mediasoup
//
//
//
//

let worker: mediasoup.types.Worker | null = null

const routers = new Map<PartyId.PartyId, mediasoup.types.Router>()

const peers = new Map<UserId.UserId, Peer>()

const mediasoupMsgs = new Rx.Subject<Msg>()

//
//
// Peer
//
//

type Peer = {
  sendTransport: mediasoup.types.Transport | null
  producer: mediasoup.types.Producer | null
  recvTransport: mediasoup.types.Transport | null
  consumers: {
    [producingUserId: UserId.UserId]: mediasoup.types.Consumer
  }
}

const initialPeer: Peer = {
  sendTransport: null,
  producer: null,
  recvTransport: null,
  consumers: {},
}

// const logInstances = () => {
//   console.log({
//     worker,
//     routers,
//     peers,
//   })
// }

//
//
//
//
//

const initWorker: Task.Task<Unit> = async () => {
  worker = await mediasoup.createWorker(Config.mediasoup.worker)

  worker.on("died", () => {
    mediasoupMsgs.next(["WorkerDied"])
  })

  return Unit
}

const initRouter =
  (partyId: PartyId.PartyId): Task.Task<CreateRouter_Done[2]> =>
    async () => {
      if (!worker) {
        return Result.Err("worker_does_not_exists")
      }

      const router = await worker.createRouter(Config.mediasoup.router)

      routers.set(partyId, router)

      return Result.Ok({
        routerRtpCapabilities: router.rtpCapabilities,
      })
    }

export const initSendTransport =
  ({
    partyId,
    userId,
  }: SendTransport_InitBackend[1]): Task.Task<
    SendTransport_InitBackend_Done[2]
  > =>
    async () => {
      const router = routers.get(partyId)

      if (!router) {
        return Result.Err("router_does_not_exists")
      }

      const sendTransport = await router.createWebRtcTransport(
        Config.mediasoup.webRtcTransport,
      )

      const peer: Peer = {
        ...initialPeer,
        ...peers.get(userId),
        sendTransport: sendTransport,
      }

      peers.set(userId, peer)

      const transportOptions: TransportOptions = {
        transportId: sendTransport.id,
        iceParameters: sendTransport.iceParameters,
        iceCandidates: sendTransport.iceCandidates,
        dtlsParameters: sendTransport.dtlsParameters,
      }

      return Result.Ok({ transportOptions })
    }

const handleSendTransport_OnConnect =
  ({
    dtlsParameters,
    userId,
  }: SendTransport_OnConnect[1]): Task.Task<SendTransport_OnConnect_Done[2]> =>
    async () => {
      const peer = peers.get(userId)

      if (!peer) {
        return Result.Err("peer_does_not_exists")
      }

      if (!peer.sendTransport) {
        return Result.Err("peer_missing_producer_transport")
      }

      try {
        await peer.sendTransport.connect({ dtlsParameters })
        return Result.Ok(Unit)
      } catch (_error) {
        return Result.Err("producer_transport_connect_errored")
      }
    }

const handleSendTransport_OnProduce =
  (
    model: Model,
    { appData, kind, rtpParameters, userId }: SendTransport_OnProduce[1],
  ): Task.Task<SendTransport_OnProduce_Done[2]> =>
    async () => {
      const peer = peers.get(userId)

      if (!peer) {
        return Result.Err("peer_does_not_exists")
      }

      if (!peer.sendTransport) {
        return Result.Err("peer_missing_producer_transport")
      }

      try {
        const producer = await peer.sendTransport.produce({
          kind: kind,
          rtpParameters: rtpParameters,
          appData: appData,
        })

        const producingPeer: Peer = {
          ...peer,
          producer,
        }

        peers.set(userId, producingPeer)

        const producingUser = model.users[userId]

        if (!producingUser) {
          return Result.Err("user_does_not_exists")
        }

        const otherUsers = Object.values(model.users).filter(
          (user) =>
            user.userId !== producingUser.userId &&
            user.partyId === producingUser.partyId,
        )

        for (const consumingUser of otherUsers) {
          const consumingPeer = peers.get(consumingUser.userId)

          if (!consumingPeer) {
            continue
          }

          if (!consumingPeer.recvTransport) {
            continue
          }

          const router = routers.get(consumingUser.partyId)

          if (!router) {
            continue
          }

          if (consumingUser.deviceRtpCapabilities.type === "None") {
            continue
          }

          const params = {
            producerId: producer.id,
            rtpCapabilities: consumingUser.deviceRtpCapabilities.value,
          }

          if (!router.canConsume(params)) {
            continue
          }

          const consumer = await consumingPeer.recvTransport.consume(params)

          peers.set(consumingUser.userId, {
            ...consumingPeer,
            consumers: {
              ...consumingPeer.consumers,
              [producingUser.userId]: consumer,
            },
          })
        }

        return Result.Ok({ producerId: producer.id })
      } catch (_error) {
        console.error(_error)
        return Result.Err("produce_threw_an_error")
      }
    }

// const toOtherUsersInParty = (
//   someUser: { userId: UserId.UserId; partyId: PartyId.PartyId },
//   model: Model,
// ): UserId.UserId[] => {
//   return Object.values(model.users)
//     .filter(
//       (user) =>
//         user.userId !== someUser.userId && user.partyId === someUser.partyId,
//     )
//     .map((user) => user.userId)
// }

const initRecvTransport =
  ({
    partyId,
    userId,
  }: RecvTransport_InitBackend[1]): Task.Task<
    RecvTransport_InitBackend_Done[2]
  > =>
    async () => {
      const router = routers.get(partyId)

      if (!router) {
        return Result.Err("router_does_not_exists")
      }

      const peerPrev = peers.get(userId) ?? initialPeer

      const recvTransport = await router.createWebRtcTransport(
        Config.mediasoup.webRtcTransport,
      )

      const peerNew: Peer = {
        ...peerPrev,
        recvTransport: recvTransport,
      }

      peers.set(userId, peerNew)

      const transportOptions: TransportOptions = {
        transportId: recvTransport.id,
        iceParameters: recvTransport.iceParameters,
        iceCandidates: recvTransport.iceCandidates,
        dtlsParameters: recvTransport.dtlsParameters,
      }

      return Result.Ok({ transportOptions })
    }

// const startConsuming =
//   ({
//     partyId,
//     userIds,
//   }: {
//     producerId: string
//     partyId: PartyId.PartyId
//     userIds: UserId.UserId[]
//   }): Task.Task<Unit> =>
//     async () => {
//       const router = routers.get(partyId)

//       if (!router) {
//         return Unit
//       }

//       for (const userId in userIds) {
//         if (!UserId.is(userId)) {
//           continue
//         }

//         const peer = peers.get(userId)

//         if (!peer) {
//           continue
//         }
//       }

//       return Unit
//     }
