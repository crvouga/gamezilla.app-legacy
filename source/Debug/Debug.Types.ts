import * as GameRoom from "../Game/GameRoom.Types"

// 
// 
// 
// Model
// 
// 
// 


export type SharedModel = {
    snapshotIndex?: number
    snapshots: Snapshot[]
}

export type Snapshot = {
    gameRoom: GameRoom.BackendModel,
    msgType: string
}

export type FrontendModel = SharedModel

export type BackendModel = SharedModel


// 
// 
// 
// Msg
// 
// 
// 

export type ToBackend = Req

export type ToFrontend = Res | ["Sync", SharedModel]

export type FrontendMsg = Req | ["ClickedBack"]

export type BackendMsg = ["Noop"]

type Req = ["GoBack"]

type Res = ["GoBack_Done", SharedModel]

export const goBack = (model: SharedModel): SharedModel => {
    const snapshotIndexNext = Math.max((model.snapshotIndex ?? model.snapshots.length - 1) - 1, 0)
    return {
        ...model,
        snapshotIndex: snapshotIndexNext
    }
}
