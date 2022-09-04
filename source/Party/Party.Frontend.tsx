import * as mediasoupClient from "mediasoup-client";
import { Cmd, pipe, Result, Sub, Task, Unit } from "../Core";
import { PartyId, UserId } from "../Data";
import * as Route from "../Route";
import * as Rx from "rxjs"
import * as Store from "../Store";
import * as UI from "../UI";
import { FrontendModel, FrontendMsg, LoadDeviceResulted, RouterRtpCapabilities, ToBackend, ToFrontend, TransportOptions, UnloadDeviceResulted } from "./Party.Types";
import { Config } from "./Config";

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = (): [Model, Cmd.Cmd<Msg>] => {

    return [
        {
            parties: {},
            users: {},
            device: { type: "Unloaded" }
        },
        Cmd.None
    ];
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = Store.Action

export const update = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        // 
        //
        //
        //
        // 

        case 'ClickedBanner': {
            return [model, Route.push(['Party'])]
        }

        case 'LoadDeviceResulted': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }
            return [{ ...model, device: { type: "Loaded" } }, Cmd.None]
        }


        case 'UnloadDeviceResulted': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }

            return [{ ...model, device: { type: "Unloaded" } }, Cmd.None]
        }


        case 'ProducerTrackEnded': {
            return [model, Cmd.None]
        }

        case 'ProducerTransportClosed': {
            return [model, Cmd.None]
        }


        // 
        //
        //
        //
        //



        case 'ProducerTransportConnect': {
            return [model, sendToBackend(msg)]
        }

        case 'ProducerTransportProduce': {
            return [model, sendToBackend(msg)]
        }

        case "StartParty": {
            return [model, sendToBackend(msg)]
        }

        case 'LeaveParty': {
            return [model, sendToBackend(msg)]
        }

        case 'JoinParty': {
            return [model, sendToBackend(msg)]
        }
    }
};

const toDeviceCmd = ({ currentUserId, modelNew, modelPrev, }: { currentUserId: UserId.UserId, modelPrev: Model, modelNew: Model }): Cmd.Cmd<Msg> => {
    const userPrev = modelPrev.users[currentUserId]
    const userNew = modelNew.users[currentUserId]

    if (userPrev && !userNew) {
        return pipe(unloadDevice, Cmd.perform(result => ['UnloadDeviceResulted', result]))
    }

    if (!userPrev && userNew) {

        const party = modelNew.parties[userNew.partyId]

        if (!party) {
            return Cmd.None
        }

        const { routerRtpCapabilities } = party

        return pipe(loadDevice({ routerRtpCapabilities }), Cmd.perform(result => ['LoadDeviceResulted', result]))
    }

    return Cmd.None
}

export const updateFromBackend = ({ currentUserId }: { currentUserId: UserId.UserId }, msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
    switch (msg[0]) {
        case 'Sync': {
            const sharedModel = msg[1]

            const modelNew: Model = {
                ...model,
                parties: sharedModel.parties,
                users: sharedModel.users
            }

            const userIds = Object.values(sharedModel.users).map(user => user.userId)

            return [
                modelNew,
                toDeviceCmd({ currentUserId, modelNew: modelNew, modelPrev: model }),
                [['Store', ['Profile', ['FindMany', { userIds }]]]]
            ]
        }

        case 'CreateTransportResulted': {
            return [model, Cmd.None, []]
        }

        case 'StartPartyResulted': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None, []]
            }

            const sharedModel = msg[1].value

            return [{ ...model, parties: sharedModel.parties, users: sharedModel.users }, Cmd.None, []]
        }

        case 'LeavePartyResulted': {
            return [model, Cmd.None, []]
        }

        case 'JoinPartyResulted': {
            return [model, Cmd.None, []]
        }
    }
}


export type Action = ['Party', ['Msg', Msg]]

export const runAction = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, action: Action, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (action[1][0]) {
        case 'Msg': {
            return update({ sendToBackend }, action[1][1], model)
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

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
    return mediasoupMsgs;
};

// 
// 
// 
// View
// 
// 
// 

export const view = ({ currentUserId, store }: { currentUserId: UserId.UserId, store: Store.Model }, model: Model): UI.View<Msg> => (dispatch) => {

    const user = model.users[currentUserId]

    if (!user) {
        return <ViewNotInParty model={model} store={store} currentUserId={currentUserId} dispatch={dispatch} />
    }

    const party = model.parties[user.partyId]

    if (!party) {
        return <ViewNotInParty model={model} store={store} currentUserId={currentUserId} dispatch={dispatch} />
    }

    return <UI.FillBox>
        <UI.Box sx={{ paddingX: 2 }}>
            <UI.ListItemText
                primary={`${store.Profile[party.hostId]?.username ?? "..."}'s party`}
                secondary={`${countUsersInParty(party.partyId, model)} in party`}
            />
        </UI.Box>

        <UI.Box sx={{ flex: 1 }}>
            {Object.values(model.users)
                .filter(user => user.partyId === party.partyId)
                .map(user => (
                    <UI.ListItemButton key={user.userId} >
                        <UI.ListItemAvatar>
                            <UI.Avatar src={store.Profile[user.userId]?.avatarUrl} />
                        </UI.ListItemAvatar>

                        <UI.ListItemText
                            primary={`${store.Profile[user.userId]?.username ?? "..."}`}
                        />
                    </UI.ListItemButton>
                ))}
        </UI.Box>
        <UI.Box sx={{ padding: 2 }}>
            <UI.Button fullWidth variant="contained" size="large" onClick={() => dispatch(['LeaveParty', { userId: currentUserId }])}>
                Leave Party
            </UI.Button>
        </UI.Box>
    </UI.FillBox>
}

const ViewNotInParty = ({ currentUserId, model, store, dispatch }: { store: Store.Model, model: Model, currentUserId: UserId.UserId, dispatch: (msg: Msg) => void }) => {
    return (
        <UI.FillBox>
            <UI.Header title="Party" />
            <UI.Box sx={{ paddingX: 2 }}>
                <UI.Button fullWidth variant="contained" size="large" onClick={() => dispatch(['StartParty', { hostId: currentUserId, partyId: PartyId.generateSync() }])}>
                    Start Party
                </UI.Button>
            </UI.Box>
            <UI.Box sx={{ flex: 1 }}>
                {Object.values(model.parties).map(party => (
                    <UI.ListItemButton key={party.partyId} onClick={() => dispatch(['JoinParty', { userId: currentUserId, partyId: party.partyId }])}>
                        <UI.ListItemAvatar>
                            <UI.Avatar src={store.Profile[party.hostId]?.avatarUrl} />
                        </UI.ListItemAvatar>

                        <UI.ListItemText
                            primary={`${store.Profile[party.hostId]?.username ?? "..."}'s party`}
                            secondary={`${countUsersInParty(party.partyId, model)} in party`}
                        />
                    </UI.ListItemButton>
                ))}
            </UI.Box>
        </UI.FillBox>
    )
}

const countUsersInParty = (partyId: PartyId.PartyId, model: Model): number => {
    return Object.values(model.users).filter(user => user.partyId === partyId).length
}

export const viewBanner = ({ route, currentUserId, model, store, }: { store: Store.Model, route: Route.Model, currentUserId: UserId.UserId, model: Model }): UI.View<Msg> => (dispatch) => {
    if (route[0] === 'Party') {
        return <></>
    }

    const user = model.users[currentUserId]

    if (!user) {
        return <></>
    }

    const party = model.parties[user.partyId]

    if (!party) {
        return <></>
    }

    return <UI.Paper
        variant="outlined"
        sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            height: 54,
            padding: 0,
            margin: 0,
        }}
    >
        <UI.ListItemButton onClick={() => dispatch(['ClickedBanner'])}>
            <UI.ListItemText
                primary={`${store.Profile[party.hostId]?.username ?? "..."}'s party`}
                secondary={`${countUsersInParty(party.partyId, model)} in party`}
            />
        </UI.ListItemButton>

    </UI.Paper>

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


const mediasoupMsgs = new Rx.Subject<Msg>()

let device: mediasoupClient.types.Device | null = null
let producerTransport: mediasoupClient.types.Transport | null = null
let producer: mediasoupClient.types.Producer | null = null

// https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerOptions
// https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
export const producerOptions: mediasoupClient.types.ProducerOptions = {
    // mediasoup params
    encodings: [
        {
            rid: 'r0',
            maxBitrate: 100000,
            scalabilityMode: 'S1T3',
        },
        {
            rid: 'r1',
            maxBitrate: 300000,
            scalabilityMode: 'S1T3',
        },
        {
            rid: 'r2',
            maxBitrate: 900000,
            scalabilityMode: 'S1T3',
        },
    ],
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
    codecOptions: {
        videoGoogleStartBitrate: 1000
    }
}

const loadDevice = ({ routerRtpCapabilities }: { routerRtpCapabilities: RouterRtpCapabilities }): Task.Task<LoadDeviceResulted[1]> => async () => {
    try {

        if (device) {
            return Result.Err("device_is_already_loaded")
        }

        const deviceNew = new mediasoupClient.Device()

        await deviceNew.load({ routerRtpCapabilities })

        device = deviceNew

        return Result.Ok(Unit)

    } catch (_error) {
        console.error(_error)
        return Result.Err("failed_to_load_device")
    }

}

const unloadDevice: Task.Task<UnloadDeviceResulted[1]> = async () => {
    try {

        if (!device) {
            return Result.Err("device_is_already_unloaded")
        }

        device = null

        return Result.Ok(Unit)

    } catch (_error) {
        return Result.Err("failed_to_unload_device")
    }

}


const createProducerTransport = ({ transportOptions, userId }: { transportOptions: TransportOptions, userId: UserId.UserId }): Task.Task<Result.Result<"device_does_not_exists", Unit>> => async () => {

    if (!device) {
        return Result.Err("device_does_not_exists")
    }

    const producerTransportNew = device.createSendTransport({
        ...transportOptions,
        iceCandidates: transportOptions.iceCandidates.map(item => ({
            ...item,
            tcpType: item.tcpType ?? "passive"
        }))
    })

    producerTransportNew.on("connect", ({ dtlsParameters, }) => {
        mediasoupMsgs.next(['ProducerTransportConnect', { dtlsParameters, userId }])
    })

    producerTransportNew.on("produce", (params) => {
        mediasoupMsgs.next(['ProducerTransportProduce', {
            appData: params.appData,
            rtpParameters: params.rtpParameters,
            mediaKind: params.kind,
            userId
        }])
    })

    producerTransport = producerTransportNew

    return Result.Ok(Unit)
}

const connectProducerTransport = (): Task.Task<Result.Result<"producer_transport_does_not_exists", Unit>> => async () => {
    if (!producerTransport) {
        return Result.Err("producer_transport_does_not_exists")
    }

    const producerNew = await producerTransport.produce(producerOptions)

    producerNew.on("trackended", () => {
        mediasoupMsgs.next(['ProducerTrackEnded'])
    })

    producerNew.on("transportclose", () => {
        mediasoupMsgs.next(['ProducerTransportClosed'])
    })

    return Result.Ok(Unit)
}