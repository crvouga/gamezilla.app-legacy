import * as mediasoupClient from "mediasoup-client";
import * as Rx from "rxjs";
import { Cmd, pipe, Result, Sub, Task, Unit } from "../Core";
import { PartyId, UserId } from "../Data";
import * as Route from "../Route";
import * as Store from "../Store";
import * as UI from "../UI";
import { Client_InitProducerTransport_Done, ConnectProducerTransport_Done, FrontendModel, FrontendMsg, UnloadMediaStream_Done, LoadDevice_Done, RouterRtpCapabilities, ToBackend, ToFrontend, TransportOptions, UnloadDevice_Done, LoadMediaStream_Done } from "./Party.Types";

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
            device: { type: "Unloaded" },
            mediaStream: { type: "Unloaded" }
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
        case 'ClickedBanner': {
            return [model, Route.push(['Party'])]
        }

        case 'LoadMediaStream_Done': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }

            return [{ ...model, mediaStream: { type: "Loaded" } }, Cmd.None]
        }

        case 'UnloadMediaStream_Done': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }

            return [{ ...model, mediaStream: { type: "Unloaded" } }, Cmd.None]
        }

        case 'LoadDevice_Done': {
            const { result, userId, partyId } = msg[1]

            if (result.type === 'Err') {
                return [model, Cmd.None]
            }

            return [
                {
                    ...model,
                    device: { type: "Loaded" }
                },
                sendToBackend(['Server_InitProducerTransport', { userId, partyId, }])
            ]
        }

        case 'Client_InitProducerTransport_Done': {
            return [
                model,
                pipe(
                    connectProducerTransport(),
                    Cmd.perform((result): Msg => ['ConnectProducerTransport_Done', result])
                )
            ]
        }

        case 'ConnectProducerTransport_Done': {
            return [model, Cmd.None]
        }

        case 'UnloadDevice_Done': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }

            return [{ ...model, device: { type: "Unloaded" } }, Cmd.None]
        }

        case 'ProducerTransport_OnConnect': {
            return [model, sendToBackend(msg)]
        }

        case 'ProducerTransport_OnProduce': {
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
                toLifecycleCmd({ currentUserId, modelNext: modelNew, modelPrev: model }),
                [['Store', ['Profile', ['FindMany', { userIds }]]]]
            ]
        }

        case 'Server_InitProducerTransport_Done': {
            const result = msg[2]

            if (result.type === 'Err') {
                return [model, Cmd.None, []]
            }

            const { userId } = msg[1]
            const options = result.value.transportOptions
            const cmd = pipe(
                initProducerTransport({ userId, options }),
                Cmd.perform((result): Msg => ['Client_InitProducerTransport_Done', result])
            )

            return [model, cmd, []]
        }

        case 'StartParty_Done': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None, []]
            }

            const sharedModel = msg[1].value

            return [{ ...model, parties: sharedModel.parties, users: sharedModel.users }, Cmd.None, []]
        }

        case 'LeaveParty_Done': {
            return [model, Cmd.None, []]
        }

        case 'JoinParty_Done': {
            return [model, Cmd.None, []]
        }
    }
}

const toLifecycleCmd = ({ currentUserId, modelNext, modelPrev, }: { currentUserId: UserId.UserId, modelPrev: Model, modelNext: Model }): Cmd.Cmd<Msg> => {
    const userPrev = modelPrev.users[currentUserId]
    const userNext = modelNext.users[currentUserId]

    // 
    //
    // did user just leave party?
    //
    // 

    if (userPrev && !userNext) {
        const deviceCmd = pipe(
            unloadDevice,
            Cmd.perform((result): Msg => ['UnloadDevice_Done', result])
        )

        const mediaStreamCmd = pipe(
            unloadMediaStream,
            Cmd.perform((result): Msg => ['UnloadMediaStream_Done', result])
        )

        return Cmd.batch([
            deviceCmd,
            mediaStreamCmd
        ])
    }

    // 
    //
    // did user just join party?
    //
    // 

    if (!userPrev && userNext) {

        const party = modelNext.parties[userNext.partyId]

        if (!party) {
            return Cmd.None
        }

        const { routerRtpCapabilities } = party

        const deviceCmd = pipe(
            loadDevice({ routerRtpCapabilities }),
            Cmd.perform((result): Msg => ['LoadDevice_Done', { userId: currentUserId, partyId: party.partyId, result }])
        )

        const mediaStreamCmd = pipe(
            loadMediaStream(),
            Cmd.perform((result): Msg => ['LoadMediaStream_Done', result])
        )

        return Cmd.batch([
            deviceCmd,
            mediaStreamCmd,
        ])
    }

    return Cmd.None
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
    return _msg$;
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
        <UI.Box sx={{ paddingX: 2, paddingY: 1 }}>
            <UI.Typography align="left">
                {`${store.Profile[party.hostId]?.username ?? "..."}'s party`}
            </UI.Typography>
            <UI.Typography variant="subtitle2" align="left" color="text.secondary">
                {`${countUsersInParty(party.partyId, model)} in party`}
            </UI.Typography>
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

    return <>
        <UI.ButtonBase
            onClick={() => dispatch(['ClickedBanner'])}
            sx={{
                width: "100%",
                height: 58,
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                paddingX: 2,
                paddingY: 1,
            }}
        >
            <UI.Box sx={{ flex: 1 }}>
                <UI.Typography align="left">
                    {`${store.Profile[party.hostId]?.username ?? "..."}'s party`}
                </UI.Typography>
                <UI.Typography variant="subtitle2" align="left" color="text.secondary">
                    {`${countUsersInParty(party.partyId, model)} in party`}
                </UI.Typography>
            </UI.Box>
            <UI.Icons.ChevronRight />
        </UI.ButtonBase>

        <UI.Divider />
    </>



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


const _msg$ = new Rx.Subject<Msg>()

let _device: mediasoupClient.types.Device | null = null
let _mediaStream: MediaStream | null = null
let _producerTransport: mediasoupClient.types.Transport | null = null


const loadMediaStream = (): Task.Task<LoadMediaStream_Done[1]> => async () => {
    try {
        _mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        })
        return Result.Ok(Unit)
    } catch (error) {
        console.log(error)
        return Result.Err("failed_to_load")
    }
}

const unloadMediaStream: Task.Task<UnloadMediaStream_Done[1]> = async () => {
    if (!_mediaStream) {
        return Result.Ok(Unit)
    }

    for (const track of _mediaStream.getTracks()) {
        if (track.readyState === 'live') {
            track.stop()
        }
    }

    _mediaStream = null

    return Result.Ok(Unit)
}

const loadDevice = ({ routerRtpCapabilities }: { routerRtpCapabilities: RouterRtpCapabilities }): Task.Task<LoadDevice_Done[1]['result']> => async () => {
    try {

        if (_device) {
            return Result.Err("device_is_already_loaded")
        }

        const deviceNew = new mediasoupClient.Device()

        await deviceNew.load({ routerRtpCapabilities })

        _device = deviceNew

        return Result.Ok(Unit)

    } catch (_error) {
        return Result.Err("failed_to_load_device")
    }

}

const unloadDevice: Task.Task<UnloadDevice_Done[1]> = async () => {
    _device = null
    return Result.Ok(Unit)
}

const initProducerTransport = ({ userId, options }: { userId: UserId.UserId, options: TransportOptions }): Task.Task<Client_InitProducerTransport_Done[1]> => async () => {
    if (!_device) {
        return Result.Err("device_does_not_exists")
    }

    _producerTransport = _device.createSendTransport({ ...options, iceCandidates: options.iceCandidates.map(item => ({ ...item, tcpType: item.tcpType ?? "passive" })) })

    _producerTransport.on("connect", ({ dtlsParameters }, callback, _errback) => {
        _msg$.next(['ProducerTransport_OnConnect', { userId, dtlsParameters }])
        callback()
    })

    _producerTransport.on("produce", ({ appData, kind, rtpParameters }, callback) => {
        _msg$.next(['ProducerTransport_OnProduce', { userId, appData, kind, rtpParameters }])
        callback({ id: options.id })
    })

    return Result.Ok(Unit)
}


const connectProducerTransport = (): Task.Task<ConnectProducerTransport_Done[1]> => async () => {
    if (!_producerTransport) {
        return Result.Err("producer_transport_does_not_exists")
    }

    if (!_mediaStream) {
        return Result.Err("media_stream_track_does_not_exists")
    }

    const track = _mediaStream.getTracks()[0]

    const producer = await _producerTransport.produce({
        track: track,
        encodings: producerOptions.encodings,
        codecOptions: producerOptions.codecOptions
    })

    return Result.Ok(Unit)
}



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
