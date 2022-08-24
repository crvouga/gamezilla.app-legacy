import { useLayoutEffect, useRef, useState } from "react"
import { Chessboard } from "react-chessboard"
import * as Bridge from "../../Bridge"
import { Audio, Cmd, Option, pipe, Sub, tag } from "../../Core"
import { RoomId, UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
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
      openedMenuId: Option.None
    },
    sendToBackend(roomId, ['Init']),

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
    case "InputPlayer": {
      return [model, sendToBackend(currentRoomId, msg)]
    }

    case "StartGame": {
      return [model, sendToBackend(currentRoomId, msg)]
    }

    case 'InputClock': {
      return [model, sendToBackend(currentRoomId, msg)]
    }

    case "AudioResulted": {
      return [model, Cmd.None]
    }

    case 'OpenedMenu': {
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None]
    }

    case 'ClosedMenu': {
      return [{ ...model, openedMenuId: Option.None }, Cmd.None]
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

    case 'InputClockResulted': {
      return [{ ...model }, Cmd.None]
    }

    case "MovedResulted": {
      return [{ ...model }, Cmd.None]
    }

    case "InputPlayerResulted": {
      return [{ ...model, }, Cmd.None]
    }

    case "StartGameResulted": {
      return [{ ...model, }, Cmd.None]
    }

    case "Sync": {
      const modelNew = msg[1]

      return [{ ...model, sharedModel: modelNew }, Cmd.None]
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
  return Sub.None
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

const chessBoardContainerId = "chessboard"

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
              <ViewGameSetupPlayerSlot
                model={model}
                dispatch={dispatch}
                store={store}
                currentUserId={currentUserId}
                playerType="White"
                userId={model.sharedModel.White}
              />

              <ViewGameSetupPlayerSlot
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

const ViewGameSetupPlayerSlot = ({
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
            <UI.ListItemButton id={menuAnchorId} onClick={() => dispatch(['OpenedMenu', menuAnchorId])}>
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
                <UI.Button size="large" onClick={() => dispatch(['InputPlayer', { userId: Option.None, playerType }])}>
                  Stop Playing
                </UI.Button>
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
              onClick={() => {
                dispatch([
                  "InputPlayer",
                  { userId: Option.Some(currentUserId), playerType },
                ])
              }}>
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
  const { boardWidth, ref } = useBoardWidth()

  const currentUserPlayerType: Board.PlayerType | "None" | "Both" =
    currentUserId === White && currentUserId === Black
      ? "Both"
      : currentUserId === White
        ? 'White'
        : currentUserId === Black
          ? 'Black'
          : "None"

  const turn = Board.toTurn(board)

  const fallbackBoardOrentation: Board.PlayerType = 'White'

  const boardOrentation: Board.PlayerType =
    currentUserPlayerType === 'None' || currentUserPlayerType === 'Both'
      ? fallbackBoardOrentation
      : currentUserPlayerType


  const whiteSlot: GameStartedPlayerSlot = {
    src: store.Profile[White]?.avatarUrl,
    username: store.Profile[White]?.username ?? "...",
    isActive: turn === 'White',
    seconds: clock.White
  }

  const blackSlot: GameStartedPlayerSlot = {
    src: store.Profile[Black]?.avatarUrl,
    username: store.Profile[Black]?.username ?? "...",
    isActive: turn === 'Black',
    seconds: clock.Black
  }

  const topSlot = boardOrentation === 'White' ? blackSlot : whiteSlot

  const bottomSlot = boardOrentation === 'White' ? whiteSlot : blackSlot


  return (
    <UI.FillBox>

      <ViewGameStartedPlayerSlot slot={topSlot} />

      <div id={chessBoardContainerId} ref={ref}>
        <Chessboard
          showBoardNotation
          snapToCursor
          boardOrientation={boardOrentation === "White" ? "white" : "black"}
          position={board.fen}
          boardWidth={boardWidth}
          isDraggablePiece={({ piece, }) => {
            return Board.pieceToPlayerType(piece) === currentUserPlayerType || currentUserPlayerType === 'Both'
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

      <ViewGameStartedPlayerSlot slot={bottomSlot} />

      <UI.Box sx={{ flex: 1 }} />

    </UI.FillBox>
  )
}

const useBoardWidth = () => {
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

  return {
    ref,
    boardWidth
  }
}


type GameStartedPlayerSlot = {
  src?: string
  username: string
  isActive: boolean
  seconds: number
}

const ViewGameStartedPlayerSlot = ({ slot }: { slot: GameStartedPlayerSlot }) => {
  const { src, username, isActive, seconds } = slot
  const theme = UI.useTheme()

  return (
    <UI.Box sx={{
      paddingX: 2,
      paddingY: 1,
      display: "flex",
      alignItems: "center",
    }}>
      <UI.Avatar
        src={src}
        sx={{
          marginRight: 1,
        }}
      />

      <UI.Box sx={{ flex: 1 }}>
        <UI.Typography>
          {username}
        </UI.Typography>
      </UI.Box>

      <UI.Paper
        variant="outlined"
        sx={{
          padding: 2,
          paddingY: 1
        }}
      >
        <UI.Typography
          color={isActive ? theme.palette.text.primary : theme.palette.text.disabled}
          variant="h6"
        >
          {formatSeconds(seconds)}
        </UI.Typography>
      </UI.Paper>
    </UI.Box>
  )
}

export const theme = {
  lightSquare: "#EBEBD0",
  darkSquare: "#779455",
}

// 
// 
// 
// View Cover Art
// 
// 
// 

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
