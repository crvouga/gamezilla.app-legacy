import * as mediasoup from "mediasoup"
import * as Rx from "rxjs"
import { Cmd, pipe, Result, Task, Unit } from "../Core"
import { PartyId } from "../Data"
import { Config } from "./Config"
import { BackendMsg, BackendModel, ToBackend, ToFrontend } from "./Party.Types"


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
        Cmd.perform(() => ['WorkerReady'])
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

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'WorkerReady': {
            return [{ ...model, worker: { type: "Ready", } }, Cmd.None]
        }

        case 'WorkerDied': {
            return [{ ...model, worker: { type: "Died", } }, Cmd.None]
        }
    }
}

export const updateFromFrontend = ({ sendToClient }: { sendToClient: (msg: ToFrontend) => Cmd.Cmd<never> }, msg: ToBackend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'CreateParty': {
            return [model, sendToClient(['CreatePartyResulted',])]
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

const createRouter = (partyId: PartyId.PartyId): Task.Task<Result.Result<"worker_does_not_exists", Unit>> => async () => {
    if (!worker) {
        return Result.Err("worker_does_not_exists")
    }

    const router = await worker.createRouter()

    routers[partyId] = router

    return Result.Ok(Unit)
}