import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Chessboard } from "react-chessboard"
import * as Bridge from "../../Bridge"
import { Audio, Browser, Cmd, Option, pipe, RemoteData, Sub, tag, Unit } from "../../Core"
import { RoomId, UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import { useTheme } from "../../UI"
import * as Board from "./Board"
import {
  canStartGame,
  Clock,
  clockPresets,
  clockPresetToString,
  FrontendModel,
  FrontendMsg,
  initSharedModel,
  move,
  Move,
  Seconds,
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

export const init = ({ roomId }: { roomId: RoomId.RoomId }): [FrontendModel, Cmd.Cmd<Msg>] => {
  return [
    {
      sharedModel: initSharedModel,
      boardWidth: 0,
      startGame: RemoteData.NotAsked,
      playAs: RemoteData.NotAsked,
      stopPlaying: RemoteData.NotAsked,
      openedMenuId: Option.None
    },
    Cmd.batch([
      sendToBackend(roomId, ['Init']),
      pipe(
        Browser.getElementById(containerHtmlId),
        Cmd.perform(tag("GetElementResulted")),
      ),
    ])
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
      return [{ ...model, openedMenuId: Option.None }, Cmd.None]
    }

    case 'PressedPlayerSlot': {
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None]
    }

    case "Move": {
      const result = move(msg[1], model.sharedModel)

      if (result.type === "Err") {
        return [model, Cmd.None]
      }

      const sharedModelNew = result.value

      if (sharedModelNew.type !== "GameStarted") {
        return [model, Cmd.None]
      }

      const sound = Board.inCheck(sharedModelNew.board) ? Sounds.check : Sounds.move

      return [
        {
          ...model,
          sharedModel: sharedModelNew,
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

  const model: Model = { ..._model, openedMenuId: Option.None }

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
      return [{ ...model, sharedModel: msg[1] }, Cmd.None]
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
      if (model.sharedModel.type === 'GameSetup') {
        return (
          <UI.FillBox>
            <UI.List disablePadding>
              <ViewPlayerSlot
                model={model}
                dispatch={dispatch}
                store={store}
                currentUserId={currentUserId}
                playerType="White"
                userId={model.sharedModel.White}
              />

              <ViewPlayerSlot
                model={model}
                dispatch={dispatch}
                store={store}
                currentUserId={currentUserId}
                playerType="Black"
                userId={model.sharedModel.Black}
              />
            </UI.List>



            <UI.Box sx={{ paddingX: 2 }}>
              <UI.Typography gutterBottom color={'text.secondary'}>
                Clock
              </UI.Typography>
              <UI.Select fullWidth value={model.sharedModel.clockPreset}>
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
                disabled={!canStartGame(model.sharedModel)}
                fullWidth
                variant="contained"
                sx={{ marginBottom: 2 }}
                onClick={() => {
                  dispatch(['StartGame'])
                }}
              >
                Start Game
              </UI.Button>
            </UI.Box>

          </UI.FillBox >
        )
      }

      return (
        <ViewGameStarted
          store={store}
          currentUserId={currentUserId}
          model={model}
          dispatch={dispatch}
          clock={model.sharedModel.clock}
          White={model.sharedModel.White}
          Black={model.sharedModel.Black}
          board={model.sharedModel.board}
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
  playerType: Board.PlayerType,
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
              open={model.openedMenuId.type === 'Some' && model.openedMenuId.value === menuAnchorId}
              onClose={() => dispatch(['ClosedMenu'])}
            >
              {userId.value === currentUserId ? (
                <UI.MenuItem onClick={() => dispatch(['StopPlaying', { userId: currentUserId, playerType }])}>
                  <UI.ListItemText primary="Stop Playing" />
                </UI.MenuItem>
              ) : (
                <UI.MenuItem >
                  <UI.ListItemText primaryTypographyProps={{ color: "text.secondary" }} primary="Not action available" />
                </UI.MenuItem>
              )}

            </UI.Menu>
          </>
        ) : (
          <UI.Box sx={{ paddingX: 2, paddingY: 1 }}>
            <UI.Button
              fullWidth
              size="large"
              variant="contained"
              onClick={() =>
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

export const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${formatTwoDigits(remainingSeconds)}`
}

const formatTwoDigits = (number: number): string => {
  if (number < 10) {
    return `0${number}`
  }
  return `${number}`
}

export const ViewGameStarted = ({
  currentUserId,
  store,
  model,
  dispatch,
  White,
  Black,
  board,
  clock,
}: {
  store: Store.Model
  currentUserId: UserId.UserId
  White: UserId.UserId
  Black: UserId.UserId
  board: Board.Model
  clock: Clock
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const [boardWidth, setBoardWidth] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
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

  const currentUserPlayerType: Board.PlayerType | 'None' =
    currentUserId === White
      ? 'White'
      : currentUserId === Black
        ? 'Black'
        : "None"

  const turn = Board.toTurn(board)

  const boardOrentation: Board.PlayerType = currentUserPlayerType === 'None' ? 'White' : currentUserPlayerType

  const white = {
    src: store.Profile[White]?.avatarUrl,
    username: store.Profile[White]?.username ?? "...",
    isActive: turn === 'White',
    seconds: clock.White
  }

  const black = {
    src: store.Profile[Black]?.avatarUrl,
    username: store.Profile[Black]?.username ?? "...",
    isActive: turn === 'Black',
    seconds: clock.Black
  }

  const playerSlots = boardOrentation === 'White' ? {
    top: black,
    bottom: white
  } : {
    top: white,
    bottom: black
  }

  return (
    <UI.FillBox id={containerHtmlId}>
      <UI.Box sx={playerBoxSx}>
        <UI.Avatar
          src={playerSlots.top.src}
          sx={playerAvatarSx}
        />

        <UI.Box sx={{ flex: 1 }}>
          <UI.Typography>
            {playerSlots.top.username}
          </UI.Typography>
        </UI.Box>

        <ViewClock isActive={playerSlots.top.isActive} seconds={playerSlots.top.seconds} />
      </UI.Box>

      <div ref={ref}>
        <Chessboard
          showBoardNotation
          snapToCursor
          boardOrientation={boardOrentation === "White" ? "white" : "black"}
          position={board.fen}
          boardWidth={boardWidth}
          isDraggablePiece={({ piece, }) => {
            return Board.pieceToPlayerType(piece) === currentUserPlayerType
          }}
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

            const isSuccessfulMove = move(msg[1], model.sharedModel).type === 'Ok'

            return isSuccessfulMove
          }}
        />
      </div>

      <UI.Box sx={playerBoxSx}>
        <UI.Avatar
          src={playerSlots.bottom.src}
          sx={playerAvatarSx}
        />

        <UI.Box sx={{ flex: 1 }}>
          <UI.Typography>
            {playerSlots.bottom.username}
          </UI.Typography>
        </UI.Box>

        <ViewClock isActive={playerSlots.bottom.isActive} seconds={playerSlots.bottom.seconds} />
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




const ViewClock = ({ isActive, seconds }: { isActive: boolean, seconds: Seconds }) => {
  const theme = UI.useTheme()
  return (
    <UI.Paper
      variant="outlined"
      sx={{ padding: 2, paddingY: 1 }}
    >
      <UI.Typography color={isActive ? theme.palette.text.primary : theme.palette.text.disabled} variant="h6">{formatSeconds(seconds)}</UI.Typography>
    </UI.Paper>
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
