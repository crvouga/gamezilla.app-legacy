import * as mediasoup from "mediasoup"
import * as Rx from "rxjs"
import { Cmd, pipe, Task, Unit } from "../Core"
import { Config } from "./Config"
import { BackendMsg, BackendModel } from "./Party.Types"


// 
// 
// 
// Model
// 
// 
// 

export type Model = BackendModel

export const init = (): [Model, Cmd.Cmd<Msg>] => [
    { type: "WorkerLoading" },
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
            return [{ type: "WorkerReady", }, Cmd.None]
        }

        case 'WorkerDied': {
            return [{ type: "WorkerDied", }, Cmd.None]
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
// Mediasoup
// 
// 
// 

const workerMsgs = new Rx.Subject<Msg>()

let worker: mediasoup.types.Worker

const createWorker: Task.Task<Unit> = async () => {
    worker = await mediasoup.createWorker(Config.mediasoup.worker)

    worker.on("died", () => {
        workerMsgs.next(['WorkerDied'])
    })

    return Unit
}