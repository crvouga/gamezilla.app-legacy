import * as mediasoup from "mediasoup"
import * as Rx from "rxjs"
import { Cmd, Option, pipe, Result, Task, Unit } from "../Core"
import { PartyId, UserId } from "../Data"
import { Config } from "./Config"
import {
    BackendModel, BackendMsg, CreateRouter_Done, joinParty, leaveParty, ProducerTransport_OnConnect, ProducerTransport_OnConnect_Done, ProducerTransport_OnProduce, ProducerTransport_OnProduce_Done, Server_InitProducerTransport, Server_InitProducerTransport_Done, ToBackend, ToFrontend, TransportOptions
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
        users: {}
    },
    pipe(
        createWorker,
        Cmd.perform(() => ['CreateWorker_Done'])
    )

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
        sendToUser: (userIds: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<never>,
        broadcast: (msg: ToFrontend) => Cmd.Cmd<never>
    },
    msg: Msg,
    model: Model
): [Model, Cmd.Cmd<Msg>] => {

    switch (msg[0]) {
        case 'CreateWorker_Done': {
            return [{ ...model, worker: { type: "Ready", } }, Cmd.None]
        }

        case 'WorkerDied': {
            return [{ ...model, worker: { type: "Died", } }, Cmd.None]
        }

        case 'Server_InitProducerTransport_Done': {
            const { userId, } = msg[1]

            return [model, sendToUser([userId], msg)]
        }

        case 'ProducerTransport_OnConnect_Done': {
            const { userId } = msg[1]

            return [model, sendToUser([userId], msg)]
        }

        case 'ProducerTransport_OnProduce_Done': {
            const { userId } = msg[1]

            return [model, sendToUser([userId], msg)]
        }

        case 'CreateRouter_Done': {
            const { partyId, hostId, } = msg[1]
            const result = msg[2]

            if (result.type === 'Err') {
                return [model, sendToUser([hostId], ['StartParty_Done', result])]
            }

            const { routerRtpCapabilities } = result.value

            const user = model.users[hostId]

            if (user) {
                return [model, sendToUser([hostId], ["StartParty_Done", Result.Err("already_in_a_party")])]
            }

            const modelNew = {
                ...model,
                parties: {
                    ...model.parties,
                    [partyId]: {
                        partyId,
                        routerRtpCapabilities,
                        hostId
                    }
                },
                users: {
                    ...model.users,
                    [hostId]: {
                        partyId,
                        userId: hostId
                    }
                }
            }

            return [
                modelNew,
                Cmd.batch([
                    broadcast(['Sync', modelNew]),
                    sendToUser([hostId], ['StartParty_Done', Result.Ok(modelNew)])
                ])
            ]
        }
    }
}

export const updateFromFrontend = ({ broadcast, sendToUser }: { broadcast: (msg: ToFrontend) => Cmd.Cmd<Msg>, sendToUser: (userId: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<never> }, msg: ToBackend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    const sendToParty = (partyId: PartyId.PartyId, msg: ToFrontend): Cmd.Cmd<never> => {
        const userIds = Object.values(model.users).flatMap(user => user.partyId === partyId ? [user.userId] : [])
        return sendToUser(userIds, msg)
    }

    switch (msg[0]) {
        case 'Server_InitProducerTransport': {
            return [
                model,
                pipe(
                    initProducerTransport(msg[1]),
                    Cmd.perform((result): Msg => ['Server_InitProducerTransport_Done', msg[1], result])
                )
            ]
        }

        case 'ProducerTransport_OnConnect': {
            return [
                model,
                pipe(
                    handleProducerTransport_OnConnect(msg[1]),
                    Cmd.perform((result): Msg => ['ProducerTransport_OnConnect_Done', { userId: msg[1].userId }, result])
                )
            ]
        }


        case 'ProducerTransport_OnProduce': {
            return [
                model,
                pipe(
                    handleProducerTransport_OnProduce(msg[1]),
                    Cmd.perform((result): Msg => ['ProducerTransport_OnProduce_Done', { userId: msg[1].userId }, result])
                )
            ]
        }

        case 'StartParty': {
            const partyId = msg[1].partyId
            const hostId = msg[1].hostId
            return [
                model,
                pipe(
                    createRouter(partyId),
                    Cmd.perform((result): Msg => ['CreateRouter_Done', { hostId, partyId }, result])
                )
            ]
        }


        case 'LeaveParty': {
            const { userId } = msg[1]

            const result = leaveParty(msg[1], model)

            if (result.result.type === 'Err') {
                return [
                    model,
                    Cmd.batch([
                        sendToUser([userId], ['Sync', model]),
                        sendToUser([userId], ['LeaveParty_Done', result])
                    ])
                ]
            }


            const sharedModelNew = result.result.value

            const user = model.users[result.userId]

            const cmd = user ? Cmd.batch([
                broadcast(['Sync', sharedModelNew]),
                sendToParty(user.partyId, ['LeaveParty_Done', { userId, result: Result.Ok(sharedModelNew) }]),
            ]) : broadcast(['Sync', sharedModelNew])

            return [
                { ...model, parties: sharedModelNew.parties, users: sharedModelNew.users },
                cmd
            ]
        }


        case 'JoinParty': {
            const { userId, partyId, } = msg[1]

            const result = joinParty(msg[1], model)

            if (result.type === 'Err') {
                return [
                    model,
                    Cmd.batch([
                        sendToUser([userId], ['Sync', model]),
                        sendToUser([userId], ['JoinParty_Done', result])
                    ])
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
                    broadcast(['Sync', modelNew]),
                    sendToParty(partyId, ['JoinParty_Done', result])
                ])
            ]


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


export const subscriptions = (model: Model) => {
    return workerMsgs
}


// 
// 
// 
// 
// 
// 

export const onClientConnected = ({ sendToUser }: { sendToUser: (userIds: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<Msg> }, maybeUserId: Option.Option<UserId.UserId>, model: Model): Cmd.Cmd<Msg> => {

    if (maybeUserId.type === 'None') {
        return Cmd.None
    }

    const userId = maybeUserId.value

    return sendToUser([userId], ['Sync', model])
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
let routers: { [partyId: PartyId.PartyId]: mediasoup.types.Router } = {}
let peers: { [userId: UserId.UserId]: Peer } = {}

type Peer = {
    producerTransport: mediasoup.types.Transport | null;
    consumerTransport: mediasoup.types.Transport | null;
    producer: mediasoup.types.Producer | null
    consumers: mediasoup.types.Consumer[]
}

const initialPeer: Peer = {
    producerTransport: null,
    consumerTransport: null,
    producer: null,
    consumers: []
}

const workerMsgs = new Rx.Subject<Msg>()

// 
// 
// 
// 
// 

const createWorker: Task.Task<Unit> = async () => {
    worker = await mediasoup.createWorker(Config.mediasoup.worker)

    worker.on("died", () => {
        workerMsgs.next(['WorkerDied'])
    })

    return Unit
}


const createRouter = (partyId: PartyId.PartyId): Task.Task<CreateRouter_Done[2]> => async () => {
    if (!worker) {
        return Result.Err("worker_does_not_exists")
    }

    const router = await worker.createRouter(Config.mediasoup.router)

    routers[partyId] = router

    return Result.Ok({
        routerRtpCapabilities: router.rtpCapabilities
    })
}


export const initProducerTransport = ({ partyId, userId }: Server_InitProducerTransport[1]): Task.Task<Server_InitProducerTransport_Done[2]> => async () => {
    const router = routers[partyId]

    if (!router) {
        return Result.Err("router_does_not_exists")
    }

    const producerTransport = await router.createWebRtcTransport(Config.mediasoup.webRtcTransport)

    let peer: Peer = {
        ...initialPeer,
        ...peers[userId],
        producerTransport
    }

    peers[userId] = peer

    const transportOptions: TransportOptions = {
        transportId: producerTransport.id,
        iceParameters: producerTransport.iceParameters,
        iceCandidates: producerTransport.iceCandidates,
        dtlsParameters: producerTransport.dtlsParameters,
    }

    return Result.Ok({ transportOptions })
}


const handleProducerTransport_OnConnect = ({ dtlsParameters, userId }: ProducerTransport_OnConnect[1]): Task.Task<ProducerTransport_OnConnect_Done[2]> => async () => {
    const peer = peers[userId]

    if (!peer) {
        return Result.Err("peer_does_not_exists")
    }

    if (!peer.producerTransport) {
        return Result.Err("peer_missing_send_transport")
    }

    await peer.producerTransport.connect({ dtlsParameters })

    return Result.Ok(Unit)
}

const handleProducerTransport_OnProduce = ({ appData, kind, rtpParameters, userId }: ProducerTransport_OnProduce[1]): Task.Task<ProducerTransport_OnProduce_Done[2]> => async () => {
    let peer = peers[userId]

    if (!peer) {
        return Result.Err("peer_does_not_exists")
    }

    if (!peer.producerTransport) {
        return Result.Err("peer_missing_send_transport")
    }

    const producer = await peer.producerTransport.produce({
        kind: kind,
        rtpParameters: rtpParameters,
        appData: appData,
    })

    peer.producer = producer

    return Result.Ok({ producerId: producer.id })
}