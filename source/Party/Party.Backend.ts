import * as mediasoup from "mediasoup"
import * as Rx from "rxjs"
import { Cmd, Option, pipe, Result, Task, Unit } from "../Core"
import { PartyId, UserId } from "../Data"
import { Config } from "./Config"
import { BackendMsg, BackendModel, ToBackend, ToFrontend, RouterRtpCapabilities, CreateRouterResult, FrontendModel } from "./Party.Types"


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


        case 'CreateParty.CreateRouterResulted': {

            const { partyId, hostId, result } = msg[1]

            if (result.type === 'Err') {
                return [model, sendToUser([hostId], ['CreatePartyResulted', result])]
            }

            const { routerRtpCapabilities } = result.value

            return [
                {
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
                },
                sendToUser([hostId], ['CreatePartyResulted', Result.Ok({ hostId, partyId, routerRtpCapabilities })])
            ]
        }
    }
}

export const updateFromFrontend = ({ sendToClient }: { sendToClient: (msg: ToFrontend) => Cmd.Cmd<never> }, msg: ToBackend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'CreateParty': {
            const partyId = msg[1].partyId
            const hostId = msg[1].hostId
            return [
                model,
                pipe(
                    createRouter(partyId),
                    Cmd.perform((result): Msg => ['CreateParty.CreateRouterResulted', { result, hostId, partyId }])
                )
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

    const user = model.users[userId]

    if (!user) {
        const frontendModel: FrontendModel = {
            type: "NotInParty",
        }

        return sendToUser([userId], ['Sync', frontendModel])
    }

    const party = model.parties[user.partyId]

    if (!party) {
        const frontendModel: FrontendModel = {
            type: "NotInParty",
        }

        return sendToUser([userId], ['Sync', frontendModel])
    }

    const frontendModel: FrontendModel = {
        hostId: party.hostId,
        partyId: party.partyId,
        routerRtpCapabilities: party.routerRtpCapabilities,
        type: "InParty",
    }

    return sendToUser([userId], ['Sync', frontendModel])
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

