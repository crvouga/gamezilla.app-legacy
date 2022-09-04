import * as mediasoup from "mediasoup"
import * as Rx from "rxjs"
import { Cmd, Option, pipe, Result, Task, Unit } from "../Core"
import { removeKey } from "../Core/Record"
import { PartyId, UserId } from "../Data"
import { Config } from "./Config"
import { BackendMsg, BackendModel, ToBackend, ToFrontend, RouterRtpCapabilities, CreateRouterResult, FrontendModel, PartyModel, leaveParty } from "./Party.Types"


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
        Cmd.perform(() => ['WorkerCreated'])
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

export const update = ({ sendToUser }: { sendToUser: (userIds: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'WorkerCreated': {
            return [{ ...model, worker: { type: "Ready", } }, Cmd.None]
        }

        case 'WorkerDied': {
            return [{ ...model, worker: { type: "Died", } }, Cmd.None]
        }


        case 'StartParty.CreateRouterResulted': {

            const { partyId, hostId, result } = msg[1]

            if (result.type === 'Err') {
                return [model, sendToUser([hostId], ['StartPartyResulted', result])]
            }

            const { routerRtpCapabilities } = result.value

            const user = model.users[hostId]

            if (user) {
                return [model, sendToUser([hostId], ["StartPartyResulted", Result.Err("already_in_a_party")])]
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
                    sendToUser([hostId], ['StartPartyResulted', Result.Ok(modelNew)])
                ])
            ]
        }
    }
}

export const updateFromFrontend = ({ sendToUser }: { sendToUser: (userId: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<never> }, msg: ToBackend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    const sendToParty = (partyId: PartyId.PartyId, msg: ToFrontend): Cmd.Cmd<never> => {
        const userIds = Object.values(model.users).flatMap(user => user.partyId === partyId ? [user.userId] : [])
        return sendToUser(userIds, msg)
    }

    switch (msg[0]) {
        case 'StartParty': {
            const partyId = msg[1].partyId
            const hostId = msg[1].hostId
            return [
                model,
                pipe(
                    createRouter(partyId),
                    Cmd.perform((result): Msg => ['StartParty.CreateRouterResulted', { result, hostId, partyId }])
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
                        sendToUser([userId], ['LeavePartyResulted', result])
                    ])
                ]
            }


            const sharedModelNew = result.result.value

            const user = model.users[result.userId]

            const cmd = user ? Cmd.batch([
                sendToParty(user.partyId, ['Sync', sharedModelNew]),
                sendToParty(user.partyId, ['LeavePartyResulted', { userId, result: Result.Ok(sharedModelNew) }])
            ]) : Cmd.None

            return [
                { ...model, parties: sharedModelNew.parties, users: sharedModelNew.users },
                cmd
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
// Mediasoup
// 
// 
// 

const workerMsgs = new Rx.Subject<Msg>()

let worker: mediasoup.types.Worker | undefined
let routers: { [partyId: PartyId.PartyId]: mediasoup.types.Router } = {}

const createWorker: Task.Task<Unit> = async () => {
    worker = await mediasoup.createWorker(Config.mediasoup.worker)

    worker.on("died", () => {
        workerMsgs.next(['WorkerDied'])
    })
    return Unit
}



const createRouter = (partyId: PartyId.PartyId): Task.Task<CreateRouterResult> => async () => {
    if (!worker) {
        return Result.Err("worker_does_not_exists")
    }

    const router = await worker.createRouter()

    routers[partyId] = router

    return Result.Ok({
        routerRtpCapabilities: router.rtpCapabilities
    })
}

