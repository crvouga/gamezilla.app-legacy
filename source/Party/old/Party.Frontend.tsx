import * as mediasoupClient from "mediasoup-client"
import * as Rx from "rxjs"
import { Cmd, exhaustive, p, rescale, Sub, Task, Unit } from "../../Core"
import { Err, Ok } from "../../Core/Result"
import { PartyId, UserId } from "../../Data"
import * as ProfileStore from "../../Profile/Profile.Store"
import * as Route from "../../Route"
import * as UI from "../../UI"
import {
  FrontendModel,
  FrontendMsg,
  LoadDevice_Done,
  LoadMediaStream_Done,
  RecvTransport_InitFrontend_Done,
  RtpCapabilities,
  SendTransport_InitFrontend_Done,
  StartProducing_Done,
  ToBackend,
  ToFrontend,
  TransportOptions,
  UnloadDevice_Done,
  UnloadMediaStream_Done,
} from "./Party.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = (): [Model, Cmd<Msg>] => {
  return [
    {
      parties: {},
      users: {},
      device: { type: "Unloaded" },
      mediaStream: { type: "Unloaded" },
      volume: 0,
      microphonePermissionStatus: "None",
      micData: new Uint8Array(),
    },
    Cmd.None,
  ]
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = ProfileStore.Action

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "MicData": {
      return [{ ...model, micData: msg[1].micData }, Cmd.None]
    }

    case "ClickedBanner": {
      return [model, Route.push(["Party"])]
    }

    case "LoadMediaStream_Done": {
      const { userId, partyId } = msg[1]
      const result = msg[2]

      if (result.type === "Err") {
        return [model, Cmd.None]
      }

      const cmd = Cmd.batch([
        sendToBackend(["SendTransport_InitBackend", { userId, partyId }]),
        sendToBackend(["RecvTransport_InitBackend", { userId, partyId }]),
      ])

      return [{ ...model, mediaStream: { type: "Loaded" } }, cmd]
    }

    case "Producer_TrackEnded": {
      return [model, Cmd.None]
    }

    case "Producer_TransportClosed": {
      return [model, Cmd.None]
    }

    case "UnloadMediaStream_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      return [{ ...model, mediaStream: { type: "Unloaded" } }, Cmd.None]
    }

    case "LoadDevice_Done": {
      const result = msg[2]

      if (result.type === "Err") {
        return [model, Cmd.None]
      }

      return [
        {
          ...model,
          device: { type: "Loaded" },
        },
        sendToBackend(msg),
      ]
    }

    case "SendTransport_InitFrontend_Done": {
      return [
        model,
        p(
          startProducing(),
          Cmd.perform((result): Msg => ["StartProducing_Done", result]),
        ),
      ]
    }

    case "StartProducing_Done": {
      return [model, Cmd.None]
    }

    case "RecvTransport_InitFrontend_Done": {
      return [model, Cmd.None]
    }

    case "UnloadDevice_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      return [{ ...model, device: { type: "Unloaded" } }, Cmd.None]
    }

    case "SendTransport_OnConnect": {
      return [model, sendToBackend(msg)]
    }

    case "SendTransport_OnProduce": {
      return [model, sendToBackend(msg)]
    }

    case "StartParty": {
      return [model, sendToBackend(msg)]
    }

    case "LeaveParty": {
      return [model, sendToBackend(msg)]
    }

    case "JoinParty": {
      return [model, sendToBackend(msg)]
    }

    case "EmittedBackendProducerId": {
      return [model, Cmd.None]
    }

    case "GotVolume": {
      return [{ ...model, volume: msg[1].volume }, Cmd.None]
    }

    case "GotMicrophonePermissionStatus": {
      return [{ ...model, microphonePermissionStatus: msg[1] }, Cmd.None]
    }

    case "RecvTransport_OnConnect": {
      return [model, sendToBackend(msg)]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromBackend = (
  { currentUserId }: { currentUserId: UserId },
  msg: ToFrontend,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Sync": {
      const sharedModel = msg[1]

      const modelNew: Model = {
        ...model,
        parties: sharedModel.parties,
        users: sharedModel.users,
      }

      const userIds = Object.values(sharedModel.users).map(
        (user) => user.userId,
      )

      return [
        modelNew,
        toLifecycleCmd({
          currentUserId,
          modelNext: modelNew,
          modelPrev: model,
        }),
        [["Profile", ["FindMany", { userIds }]]],
      ]
    }

    case "RecvTransport_InitBackend_Done": {
      const { userId } = msg[1]

      const result = msg[2]

      if (result.type === "Err") {
        return [model, Cmd.None, []]
      }

      const { transportOptions } = result.value

      const cmd = p(
        initRecvTransport({ userId, transportOptions }),
        Cmd.perform(
          (result): Msg => ["RecvTransport_InitFrontend_Done", result],
        ),
      )

      return [model, cmd, []]
    }

    case "SendTransport_OnConnect_Done": {
      return [model, Cmd.None, []]
    }

    case "SendTransport_OnProduce_Done": {
      const result = msg[2]

      if (result.type === "Err") {
        return [model, Cmd.None, []]
      }

      const producerId = result.value.producerId

      const cmd = p(
        emitBackendProducerId({ producerId }),
        Cmd.perform((): Msg => ["EmittedBackendProducerId", { producerId }]),
      )

      return [model, cmd, []]
    }

    case "SendTransport_InitBackend_Done": {
      const result = msg[2]

      if (result.type === "Err") {
        return [model, Cmd.None, []]
      }

      const { userId } = msg[1]

      const options = result.value.transportOptions

      const cmd = p(
        initSendTransport({ userId, transportOptions: options }),
        Cmd.perform(
          (result): Msg => ["SendTransport_InitFrontend_Done", result],
        ),
      )

      return [model, cmd, []]
    }

    case "StartParty_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }

      const sharedModel = msg[1].value

      return [
        { ...model, parties: sharedModel.parties, users: sharedModel.users },
        Cmd.None,
        [],
      ]
    }

    case "LeaveParty_Done": {
      return [model, Cmd.None, []]
    }

    case "JoinParty_Done": {
      return [model, Cmd.None, []]
    }

    case "RecvTransport_OnConnect_Done": {
      return [model, Cmd.None, []]
    }

    default: {
      return exhaustive(msg[1])
    }
  }
}

const toLifecycleCmd = ({
  currentUserId,
  modelNext,
  modelPrev,
}: {
  currentUserId: UserId
  modelPrev: Model
  modelNext: Model
}): Cmd<Msg> => {
  const userPrev = modelPrev.users[currentUserId]
  const userNext = modelNext.users[currentUserId]

  //
  //
  // did user just leave party?
  //
  //

  if (userPrev && !userNext) {
    const deviceCmd = p(
      unloadDevice,
      Cmd.perform((result): Msg => ["UnloadDevice_Done", result]),
    )

    const mediaStreamCmd = p(
      unloadMediaStream,
      Cmd.perform((result): Msg => ["UnloadMediaStream_Done", result]),
    )

    return Cmd.batch([deviceCmd, mediaStreamCmd])
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

    const deviceCmd = p(
      loadDevice({ routerRtpCapabilities }),
      Cmd.perform((result): Msg => ["LoadDevice_Done", userNext, result]),
    )

    const mediaStreamCmd = p(
      loadMediaStream(),
      Cmd.perform((result): Msg => ["LoadMediaStream_Done", userNext, result]),
    )

    return Cmd.batch([deviceCmd, mediaStreamCmd])
  }

  return Cmd.None
}

export type Action = ["Party", ["Msg", Msg]]

export const runAction = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  action: Action,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (action[1][0]) {
    case "Msg": {
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

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.batch([mediasoupClientMsgs])
}

//
//
//
// View
//
//
//

export const View = ({
  currentUserId,
  store,
  model,
  $send,
}: {
  currentUserId: UserId
  store: ProfileStore.Model
  model: Model
  $send: (msg: Msg) => void
}) => {
  const theme = UI.useTheme()
  const user = model.users[currentUserId]

  if (!user) {
    return (
      <ViewNotInParty
        model={model}
        store={store}
        currentUserId={currentUserId}
        $send={$send}
      />
    )
  }

  const party = model.parties[user.partyId]

  if (!party) {
    return (
      <ViewNotInParty
        model={model}
        store={store}
        currentUserId={currentUserId}
        $send={$send}
      />
    )
  }

  return (
    <UI.FillBox>
      <UI.Box
        sx={{ flex: 1, display: "flex", flexWrap: "wrap", width: "100%" }}
      >
        {Object.values(model.users)
          .filter((user) => user.partyId === party.partyId)
          .map((user) => {
            const isActive =
              Math.round(
                rescale({ value: model.volume, from: [0, 10], to: [0, 1] }),
              ) === 1

            return (
              <UI.Box
                key={user.userId}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <UI.Box sx={{ padding: 2 }}>
                  <UI.Avatar
                    src={store.profiles[user.userId]?.avatarUrl}
                    sx={{
                      width: 100,
                      height: 100,
                      boxSizing: "content-box",
                      border: `solid 8px ${isActive ? theme.palette.primary.main : "transparent"
                        }`,
                    }}
                  />
                </UI.Box>
                <UI.Typography
                  variant="h6"
                  noWrap
                  sx={{ width: "100%", paddingX: 1 }}
                  align="center"
                >
                  {`${store.profiles[user.userId]?.username ?? "..."}`}
                </UI.Typography>
                <UI.Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ height: "1rem" }}
                >
                  {party.hostId === user.userId ? "Host" : " "}
                </UI.Typography>
              </UI.Box>
            )
          })}
      </UI.Box>
      <UI.Box
        sx={{
          paddingX: 2,
          paddingY: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UI.Button
          variant="outlined"
          startIcon={<UI.Icons.CallEnd />}
          color="error"
          size="large"
          onClick={() => $send(["LeaveParty", { userId: currentUserId }])}
        >
          Leave
        </UI.Button>
      </UI.Box>
    </UI.FillBox>
  )
}

const ViewNotInParty = ({
  currentUserId,
  model,
  store,
  $send,
}: {
  store: ProfileStore.Model
  model: Model
  currentUserId: UserId
  $send: (msg: Msg) => void
}) => {
  const parties = Object.values(model.parties)
  return (
    <UI.FillBox>
      <UI.Header title="Party" />
      <UI.Box sx={{ paddingX: 2 }}>
        <UI.Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() =>
            $send([
              "StartParty",
              { hostId: currentUserId, partyId: PartyId.generate() },
            ])
          }
        >
          Start Party
        </UI.Button>
      </UI.Box>
      <UI.Box sx={{ flex: 1 }}>
        {parties.length === 0 && (
          <UI.Typography sx={{ padding: 2 }} color="text.secondary">
            No active parties
          </UI.Typography>
        )}
        {parties.map((party) => (
          <UI.ListItemButton
            key={party.partyId}
            onClick={() =>
              $send([
                "JoinParty",
                { userId: currentUserId, partyId: party.partyId },
              ])
            }
          >
            <UI.ListItemAvatar>
              <UI.Avatar src={store.profiles[party.hostId]?.avatarUrl} />
            </UI.ListItemAvatar>

            <UI.ListItemText
              primary={`${store.profiles[party.hostId]?.username ?? "..."
                }'s party`}
              secondary={`${countUsersInParty(party.partyId, model)} in party`}
            />
          </UI.ListItemButton>
        ))}
      </UI.Box>
    </UI.FillBox>
  )
}

const countUsersInParty = (partyId: PartyId, model: Model): number => {
  let count = 0
  for (const userId in model.users) {
    if (UserId.is(userId) && model.users[userId]?.partyId === partyId) {
      count++
    }
  }
  return count
}

export const ViewBanner = ({
  $send,
  route,
  currentUserId,
  model,
}: // store,
  {
    store: ProfileStore.Model
    route: Route.Model
    currentUserId: UserId
    model: Model
    $send: (msg: Msg) => void
  }) => {
  if (route[0] === "Party") {
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

  return (
    <UI.Typography
      variant="caption"
      align="center"
      onClick={() => $send(["ClickedBanner"])}
      sx={{
        width: "100%",
        paddingX: 2,
        paddingY: 1 / 2,
        backgroundColor: "primary.main",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <UI.Icons.Group sx={{ marginRight: 1 / 2 }} />
      Party
    </UI.Typography>
  )

  // return (
  //   <>
  //     <UI.ButtonBase
  //       onClick={() => $send(["ClickedBanner"])}
  //       sx={{
  //         width: "100%",
  //         height: 58,
  //         display: "flex",
  //         alignItems: "center",
  //         flexDirection: "row",
  //         paddingX: 2,
  //         paddingY: 1,
  //       }}
  //     >
  //       <UI.Box sx={{ flex: 1 }}>
  //         <UI.Typography align="left">
  //           {`${store.Profile[party.hostId]?.username ?? "..."}'s party`}
  //         </UI.Typography>
  //         <UI.Typography
  //           variant="subtitle2"
  //           align="left"
  //           color="text.secondary"
  //         >
  //           {`${countUsersInParty(party.partyId, model)} in party`}
  //         </UI.Typography>
  //       </UI.Box>
  //       <UI.Icons.ChevronRight />
  //     </UI.ButtonBase>

  //     <UI.Divider />
  //   </>
  // )
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

let device: mediasoupClient.types.Device | null = null

const localStream$ = new Rx.BehaviorSubject<MediaStream | null>(null)

let sendTransport: mediasoupClient.types.Transport | null = null

let recvTransport: mediasoupClient.types.Transport | null = null

let producer: mediasoupClient.types.Producer | null = null

// const _consumers = new Map<UserId, mediasoupClient.types.Consumer>()

const mediasoupClientMsgs = new Rx.Subject<Msg>()

//
//
//
//
//
//

const loadMediaStream = (): Task<LoadMediaStream_Done[2]> => async () => {
  try {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    localStream$.next(localStream)
    return Ok(Unit)
  } catch (error) {
    console.error(error)
    return Err("failed_to_load")
  }
}

const unloadMediaStream: Task<UnloadMediaStream_Done[1]> = async () => {
  const mediaStream = localStream$.getValue()

  if (!mediaStream) {
    return Ok(Unit)
  }

  for (const track of mediaStream.getTracks()) {
    if (track.readyState === "live") {
      track.stop()
    }
  }

  localStream$.next(null)

  return Ok(Unit)
}

const loadDevice =
  ({
    routerRtpCapabilities,
  }: {
    routerRtpCapabilities: RtpCapabilities
  }): Task<LoadDevice_Done[2]> =>
    async () => {
      try {
        if (device) {
          return Err("device_is_already_loaded")
        }

        const deviceNew = new mediasoupClient.Device()

        await deviceNew.load({ routerRtpCapabilities })

        device = deviceNew

        return Ok({
          deviceRtpCapabilities: deviceNew.rtpCapabilities,
        })
      } catch (_error) {
        console.error(_error)
        return Err("failed_to_load_device")
      }
    }

const unloadDevice: Task<UnloadDevice_Done[1]> = async () => {
  device = null
  return Ok(Unit)
}

const backendProducerId$ = new Rx.Subject<{ producerId: string }>()
const emitBackendProducerId =
  ({ producerId }: { producerId: string }): Task<Unit> =>
    async () => {
      backendProducerId$.next({ producerId })
      return Unit
    }

const initSendTransport =
  ({
    userId,
    transportOptions,
  }: {
    userId: UserId
    transportOptions: TransportOptions
  }): Task<SendTransport_InitFrontend_Done[1]> =>
    async () => {
      if (!device) {
        return Err("device_does_not_exists")
      }

      if (sendTransport) {
        return Err("producer_transport_is_already_initialized")
      }

      sendTransport = device.createSendTransport({
        ...transportOptions,
        id: transportOptions.transportId,

        // @ts-ignore
        iceCandidates: transportOptions.iceCandidates,

        // this fixes compiler error but cause runtime error 😑
        // iceCandidates: options.iceCandidates.map(item => ({
        //     ...item, tcpType: item.tcpType ?? "passive"
        // }))
      })

      sendTransport.on("connect", ({ dtlsParameters }, callback, _errback) => {
        mediasoupClientMsgs.next([
          "SendTransport_OnConnect",
          { userId, dtlsParameters },
        ])
        callback()
      })

      sendTransport.on(
        "produce",
        ({ appData, kind, rtpParameters }, callback) => {
          mediasoupClientMsgs.next([
            "SendTransport_OnProduce",
            { userId, appData, kind, rtpParameters },
          ])
          backendProducerId$.subscribe(({ producerId }) => {
            callback({
              id: producerId,
            })
          })
        },
      )

      return Ok(Unit)
    }

const startProducing = (): Task<StartProducing_Done[1]> => async () => {
  if (!sendTransport) {
    return Err("send_transport_does_not_exists")
  }

  const mediaStream = localStream$.getValue()

  if (!mediaStream) {
    return Err("media_stream_track_does_not_exists")
  }

  const track = mediaStream.getTracks()[0]

  try {
    producer = await sendTransport.produce({
      track: track,
    })

    producer.on("trackended", () => {
      mediasoupClientMsgs.next(["Producer_TrackEnded"])
    })

    producer.on("transportclose", () => {
      mediasoupClientMsgs.next(["Producer_TransportClosed"])
    })

    return Ok(Unit)
  } catch (_error) {
    console.error(_error)
    return Err("failed")
  }
}

const initRecvTransport =
  ({
    userId,
    transportOptions,
  }: {
    userId: UserId
    transportOptions: TransportOptions
  }): Task<RecvTransport_InitFrontend_Done[1]> =>
    async () => {
      if (!device) {
        return Err("device_does_not_exists")
      }

      recvTransport = device.createRecvTransport({
        ...transportOptions,
        id: transportOptions.transportId,

        // @ts-ignore
        iceCandidates: transportOptions.iceCandidates,

        // this fixes compiler error but cause runtime error 😑
        // iceCandidates: transportOptions.iceCandidates.map(item => ({
        //     ...item, tcpType: item.tcpType ?? "passive"
        // }))
      })

      recvTransport.on("connect", ({ dtlsParameters }, callback) => {
        mediasoupClientMsgs.next([
          "RecvTransport_OnConnect",
          { userId, dtlsParameters },
        ])
        callback()
      })

      return Ok(Unit)
    }

// https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerOptions
// https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
export const producerOptions: mediasoupClient.types.ProducerOptions = {
  // mediasoup params
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
}
