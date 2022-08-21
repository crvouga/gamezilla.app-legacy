import { useLayoutEffect, useRef, useState } from "react"
import { Chessboard } from "react-chessboard"
import * as Bridge from "../../Bridge"
import { Option, Audio, Browser, Cmd, pipe, RemoteData, Sub, tag, Unit } from "../../Core"
import { RoomId, UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import {
  canStartGame,
  clockPresets,
  clockPresetToString,
  FrontendModel,
  FrontendMsg,
  inCheck,
  initSharedModel,
  move,
  Move,
  PlayerType,
  ToBackend,
  ToFrontend
} from "./Chess.Types"
import { Sounds } from "./Sounds"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = (): [FrontendModel, Cmd.Cmd<Msg>] => {
  return [
    {
      ...initSharedModel,
      boardWidth: 0,
      startGame: RemoteData.NotAsked,
      playAs: RemoteData.NotAsked,
      stopPlaying: RemoteData.NotAsked,
      menu: ["Closed"]
    },
    pipe(
      Browser.getElementById(containerHtmlId),
      Cmd.perform(tag("GetElementResulted")),
    ),
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

export const update = (
  { currentRoomId }: { currentRoomId: RoomId.RoomId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "GetElementResulted": {
      const result = msg[1]

      if (result.type === "Err") {
        return [model, Cmd.None]
      }

      const element = result.value

      return [{ ...model, boardWidth: element.offsetWidth }, Cmd.None]
    }

    case "BrowserResized": {
      return [
        model,
        pipe(
          Browser.getElementById(containerHtmlId),
          Cmd.perform((element): Msg => ["GetElementResulted", element]),
        ),
      ]
    }

    case "PlayAs": {
      return [model, sendToBackend(currentRoomId, msg)]
    }

    case "StartGame": {
      return [model, sendToBackend(currentRoomId, msg)]
    }

    case "StopPlaying": {
      return [model, sendToBackend(currentRoomId, msg)]
    }

    case 'InputClock': {
      return [model, sendToBackend(currentRoomId, msg)]
    }

    case "AudioResulted": {
      return [model, Cmd.None]
    }

    case 'ClosedMenu': {
      return [{ ...model, menu: ['Closed'] }, Cmd.None]
    }

    case 'PressedPlayerSlot': {
      return [{ ...model, menu: ['Opened', { menuId: msg[1] }] }, Cmd.None]
    }

    case "Move": {
      const result = move(msg[1], model)

      if (result.type === "Err") {
        return [model, Cmd.None]
      }

      const sharedModel = result.value

      const sound = inCheck(sharedModel) ? Sounds.check : Sounds.move

      return [
        {
          ...model,
          ...sharedModel,
        },
        Cmd.batch([
          sendToBackend(currentRoomId, msg),
          pipe(Audio.play(sound), Cmd.perform(tag("AudioResulted"))),
        ]),
      ]
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  _model: Model,
): [Model, Cmd.Cmd<Msg>] => {

  const model: Model = { ..._model, menu: ["Closed"] }

  switch (msg[0]) {

    case 'InputtedClock': {
      return [{ ...model }, Cmd.None]
    }

    case "MovedResulted": {
      return [{ ...model }, Cmd.None]
    }

    case "PlayAsResulted": {
      const playAs = pipe(
        msg[1],
        RemoteData.fromResult,
        RemoteData.map(() => Unit)
      )
      return [{ ...model, playAs }, Cmd.None]
    }

    case "StartGameResulted": {
      const startGame = pipe(
        msg[1],
        RemoteData.fromResult,
        RemoteData.map(() => Unit)
      )
      return [{ ...model, startGame }, Cmd.None]
    }

    case "StopPlayingResulted": {
      return [{ ...model, }, Cmd.None]
    }

    case "Sync": {
      const sharedModel = msg[1]
      return [{ ...model, ...sharedModel }, Cmd.None]
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

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
  return Browser.onResize(tag("BrowserResized"))
}

//
//
//
// Bridge
//
//
//

export const sendToBackend = (roomId: RoomId.RoomId, toBackend: ToBackend) => {
  return Bridge.sendToBackend(["GameRoom", ["Games", roomId, ["Chess", toBackend]]])
}

//
//
//
// View
//
//
//

const containerHtmlId = "chess"

export const view =
  (
    {
      currentUserId,
      store,
    }: {
      store: Store.Model
      currentUserId: UserId.UserId
    },
    model: Model,
  ): UI.View<Msg> =>
    (dispatch) => {




      if (model.mode[0] === 'GameSetup') {

        return (
          <UI.FillBox>
            <UI.List disablePadding>
              <ViewPlayerSlot
                model={model}
                dispatch={dispatch}
                store={store}
                currentUserId={currentUserId}
                playerType="White"
                userId={model.mode[1].White}
              />

              <ViewPlayerSlot
                model={model}
                dispatch={dispatch}
                store={store}
                currentUserId={currentUserId}
                playerType="Black"
                userId={model.mode[1].Black}
              />



            </UI.List>



            <UI.Box sx={{ paddingX: 2 }}>
              <UI.Typography gutterBottom color={'text.secondary'}>
                Time
              </UI.Typography>
              <UI.Select fullWidth value={model.mode[1].clockPreset}>
                {Object.values(clockPresets)
                  .map((clockPreset) => (
                    <UI.MenuItem
                      key={clockPreset}
                      value={clockPreset}
                      onClick={() => dispatch(['InputClock', clockPreset])}
                    >
                      {clockPresetToString(clockPreset)}
                    </UI.MenuItem>)
                  )}
              </UI.Select>
            </UI.Box>

            <UI.Box sx={{ flex: 1 }}></UI.Box>

            <UI.Box sx={{ paddingX: 2 }}>
              <UI.Button
                disabled={!canStartGame(model)}
                fullWidth
                variant="contained"
                sx={{ marginBottom: 2 }}
                onClick={() => {
                  dispatch(['StartGame'])
                }}
              >
                Start
              </UI.Button>
            </UI.Box>

          </UI.FillBox >
        )
      }





      return (
        <View
          store={store}
          currentUserId={currentUserId}
          model={model}
          dispatch={dispatch}
          White={model.mode[1].White}
          Black={model.mode[1].Black}
        />
      )
    }

const ViewPlayerSlot = ({
  userId,
  playerType,
  dispatch,
  store,
  currentUserId,
  model
}: {
  playerType: PlayerType,
  userId: Option.Option<UserId.UserId>;
  currentUserId: UserId.UserId,
  store: Store.Model;
  dispatch: (msg: Msg) => void,
  model: Model
}) => {
  const menuAnchorId = playerType

  return (
    <>
      <UI.Typography sx={{ paddingX: 2, }} color="text.secondary">
        {playerType}
      </UI.Typography>

      <UI.Box sx={{ height: "72px" }}>
        {userId.type === 'Some' ? (
          <>
            <UI.ListItemButton id={menuAnchorId} onClick={() => dispatch(['PressedPlayerSlot', menuAnchorId])}>
              <UI.ListItemAvatar>
                <UI.Avatar src={store.Profile[userId.value]?.avatarUrl} />
              </UI.ListItemAvatar>
              <UI.ListItemText primary={store.Profile[userId.value]?.username ?? "..."} />
              <UI.ListItemSecondaryAction>
                <UI.Icons.MoreVert />
              </UI.ListItemSecondaryAction>
            </UI.ListItemButton>
            <UI.Menu
              anchorEl={document.getElementById(menuAnchorId)}
              open={model.menu[0] === 'Opened' && model.menu[1].menuId === menuAnchorId}
              onClose={() => dispatch(['ClosedMenu'])}
            >
              {userId.value === currentUserId && (
                <UI.MenuItem onClick={() => dispatch(['StopPlaying', { userId: currentUserId, playerType }])}>
                  <UI.ListItemText primary="Stop Playing" />
                </UI.MenuItem>
              )}
            </UI.Menu>
          </>
        ) : (
          <UI.Box sx={{ paddingX: 2, paddingY: 1 }}>
            <UI.Button fullWidth size="large" variant="outlined" onClick={() =>
              dispatch([
                "PlayAs",
                { userId: currentUserId, playerType },
              ])
            }>
              Play As {playerType}
            </UI.Button>
          </UI.Box>
        )}
      </UI.Box>
    </>
  )
}

export const View = ({
  currentUserId,
  store,
  model,
  dispatch,
  White,
  Black,
}: {
  store: Store.Model
  currentUserId: UserId.UserId
  White: UserId.UserId
  Black: UserId.UserId
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const [boardWidth, setBoardWidth] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const handler = () => {
      if (ref.current) {
        setBoardWidth(ref.current?.offsetWidth)
      }
    }

    handler()

    window.addEventListener("resize", handler)
    return () => {
      window.removeEventListener("resize", handler)
    }
  }, [])

  const playerBoxSx: UI.Sx = {
    paddingX: 2,
    paddingY: 1,
    display: "flex",
    alignItems: "center",
  }

  const playerAvatarSx: UI.Sx = {
    marginRight: 1,
  }

  return (
    <UI.FillBox id={containerHtmlId}>
      <UI.Box sx={playerBoxSx}>
        <UI.Avatar
          src={store.Profile[White]?.avatarUrl}
          sx={playerAvatarSx}
        />

        <UI.Box sx={{ flex: 1 }}>
          <UI.Typography>
            {store.Profile[White]?.username ?? "..."}
          </UI.Typography>
        </UI.Box>

        <UI.Paper
          variant="outlined"
          sx={{ paddingX: 1, paddingY: 1 / 2 }}
        >
          <UI.Typography>0:00</UI.Typography>
        </UI.Paper>
      </UI.Box>

      <div ref={ref}>
        <Chessboard
          showBoardNotation
          snapToCursor
          boardOrientation="white"
          position={model.fen}
          boardWidth={boardWidth}
          onPieceDrop={(sourceSquare, targetSquare, _piece) => {
            const msg: Move = [
              "Move",
              {
                userId: currentUserId,
                from: sourceSquare,
                to: targetSquare,
                promotion: "q",
              },
            ]

            dispatch(msg)

            return true
          }}
        />
      </div>

      <UI.Box sx={playerBoxSx}>
        <UI.Avatar
          src={store.Profile[Black]?.avatarUrl}
          sx={playerAvatarSx}
        />

        <UI.Box sx={{ flex: 1 }}>
          <UI.Typography>
            {store.Profile[Black]?.username ?? "..."}
          </UI.Typography>
        </UI.Box>

        <UI.Paper
          variant="outlined"
          sx={{ paddingX: 1, paddingY: 1 / 2 }}
        >
          <UI.Typography>0:00</UI.Typography>
        </UI.Paper>
      </UI.Box>

      <UI.Box sx={{ flex: 1 }} />

      <UI.Box sx={{ display: "flex" }}>
        <UI.ButtonBase sx={{ padding: 2 }}>
          <UI.Icons.Menu />
        </UI.ButtonBase>
      </UI.Box>
    </UI.FillBox>
  )
}

export const theme = {
  lightSquare: "#EBEBD0",
  darkSquare: "#779455",
}

export const CoverArt = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 2 2"
    >
      <rect
        x={0}
        y={0}
        width={1}
        height={1}
        fill={theme.lightSquare}
      />

      <rect
        x={0}
        y={1}
        width={1}
        height={1}
        fill={theme.darkSquare}
      />

      <rect
        x={1}
        y={1}
        width={1}
        height={1}
        fill={theme.lightSquare}
      />

      <rect
        x={1}
        y={0}
        width={1}
        height={1}
        fill={theme.darkSquare}
      />
    </svg>
  )
}
