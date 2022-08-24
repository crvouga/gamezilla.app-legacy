import { useLayoutEffect, useRef, useState } from "react"
import { Chessboard } from "react-chessboard"
import * as Bridge from "../../Bridge"
import { Audio, Cmd, exhaustive, Option, pipe, Sub, tag, View } from "../../Core"
import { RoomId, UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import * as Board from "./Board"
import {
  canStartGame,
  Clock,
  clockPresets,
  clockPresetToString,
  DrawByAgreement,
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
      openedMenuId: Option.None,
      openedModal: Option.None,
      isFlipped: false
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

    case 'AskToDraw': {
      return [model, sendToBackend(currentRoomId, msg)]
    }

    case 'Resign': {
      return [{ ...model, openedModal: Option.None }, sendToBackend(currentRoomId, msg)]
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


    case 'ClickedFlip': {
      return [{ ...model, isFlipped: !model.isFlipped }, Cmd.None]
    }

    case 'OpenedModal': {
      return [{ ...model, openedModal: Option.Some(msg[1]) }, Cmd.None]
    }

    case 'ClosedModal': {
      return [{ ...model, openedModal: Option.None }, Cmd.None]
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

    default:
      return exhaustive(msg[0])
  }
}



export const updateFromBackend = (
  msg: ToFrontend,
  _model: Model,
): [Model, Cmd.Cmd<Msg>] => {

  const model: Model = { ..._model, openedMenuId: Option.None }

  switch (msg[0]) {
    case "Sync": {
      const modelNew = msg[1]

      return [{ ...model, sharedModel: modelNew }, Cmd.None]
    }

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

    case 'AskToDrawResulted': {
      switch (msg[1].type) {
        case 'Err': {

          return [{ ...model, }, Cmd.None]
        }

        case 'Ok': {
          return [{ ...model, openedModal: Option.Some("AskedToDraw") }, Cmd.None]
        }
      }
    }

    case 'ResignResulted': {
      return [{ ...model, }, Cmd.None]
    }

    default: {
      return exhaustive(msg[0])
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
                color="w"
                userId={model.sharedModel.w}
              />

              <ViewGameSetupPlayerSlot
                model={model}
                dispatch={dispatch}
                store={store}
                currentUserId={currentUserId}
                color="b"
                userId={model.sharedModel.b}
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
          drawByAgreement={model.sharedModel.drawByAgreement}
          clock={model.sharedModel.clock}
          w={model.sharedModel.w}
          b={model.sharedModel.b}
          board={model.sharedModel.board}
        />
      )
    }

const ViewGameSetupPlayerSlot = ({
  userId,
  color,
  dispatch,
  store,
  currentUserId,
  model
}: {
  color: Board.Color,
  userId: Option.Option<UserId.UserId>;
  currentUserId: UserId.UserId,
  store: Store.Model;
  dispatch: (msg: Msg) => void,
  model: Model
}) => {
  const menuAnchorId = color
  const colorString = Board.colorToString(color)

  return (
    <>
      <UI.Typography sx={{ paddingX: 2, }} color="text.secondary">
        {colorString}
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
                <UI.Button size="large" onClick={() => dispatch(['InputPlayer', { userId: Option.None, color }])}>
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
                  { userId: Option.Some(currentUserId), color },
                ])
              }}>
              Play As {colorString}
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
  w,
  b,
  board,
  clock,
  drawByAgreement,
  dispatch,
}: {
  store: Store.Model
  currentUserId: UserId.UserId,
  w: UserId.UserId
  b: UserId.UserId
  board: Board.Model
  clock: Clock
  model: Model
  drawByAgreement: DrawByAgreement
  dispatch: (msg: Msg) => void
}) => {
  const { boardWidth, ref } = useBoardWidth()

  const currentUserColor: Board.Color | "None" | "Both" =
    currentUserId === w && currentUserId === b
      ? "Both"
      : currentUserId === w
        ? 'w'
        : currentUserId === b
          ? 'b'
          : "None"

  const turn = Board.toTurn(board)

  const fallbackBoardOrentation: Board.Color = 'w'

  const boardOrentation: Board.Color = pipe(
    currentUserColor === 'None' || currentUserColor === 'Both'
      ? fallbackBoardOrentation
      : currentUserColor,
    color => model.isFlipped ? Board.toOppositeColor(color) : color
  )


  const whiteSlot: GameStartedPlayerSlot = {
    src: store.Profile[w]?.avatarUrl,
    username: store.Profile[w]?.username ?? "...",
    isActive: turn === 'w',
    seconds: clock.w
  }

  const blackSlot: GameStartedPlayerSlot = {
    src: store.Profile[b]?.avatarUrl,
    username: store.Profile[b]?.username ?? "...",
    isActive: turn === 'b',
    seconds: clock.b
  }

  const topSlot = boardOrentation === 'w' ? blackSlot : whiteSlot

  const bottomSlot = boardOrentation === 'w' ? whiteSlot : blackSlot



  return (
    <UI.FillBox>
      <ViewGameStartedPlayerSlot slot={topSlot} />

      <div id={chessBoardContainerId} ref={ref}>
        <Chessboard
          showBoardNotation
          snapToCursor
          boardOrientation={boardOrentation === "w" ? "white" : "black"}
          position={board.fen}
          boardWidth={boardWidth}
          isDraggablePiece={({ piece, }) => {
            return Board.toColor(piece) === currentUserColor || currentUserColor === 'Both'
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

      <UI.Divider />

      <UI.Box sx={{ width: "100%", display: "flex" }}>
        {(currentUserColor === 'w' || currentUserColor === 'b') && <>
          <ViewActionButton
            icon={<UI.Icons.HandshakeTwoTone />}
            title="Draw"
            onClick={() => dispatch(['OpenedModal', 'AskToDraw'])}
          />

          <UI.ConformationDialog
            headerIcon={<UI.Icons.HandshakeTwoTone style={{ width: 48, height: 48 }} />}
            onCancel={() => dispatch(['ClosedModal'])}
            onClose={() => dispatch(['ClosedModal'])}
            onConfirm={() => dispatch(['AskToDraw', currentUserColor])}
            open={model.openedModal.type === 'Some' && model.openedModal.value === 'AskToDraw'}
            title="Ask to draw?"
            confirmTitle="Ask"
          />

          <UI.LoadingDialog open={drawByAgreement.type === 'Asked' && currentUserColor === drawByAgreement.asker} title="Waiting on other player..." />

          <UI.ConformationDialog
            open={drawByAgreement.type === 'Asked' && Board.toOppositeColor(currentUserColor) === drawByAgreement.asker}
            headerIcon={<UI.Icons.HandshakeTwoTone style={{ width: 48, height: 48 }} />}
            onCancel={() => dispatch(['ClosedModal'])}
            onClose={() => dispatch(['ClosedModal'])}
            onConfirm={() => { }}
            title="Agree to a draw?"
            confirmTitle="Accept"
            cancelTitle="Decline"
          />


          <UI.Divider orientation="vertical" />

          <ViewActionButton
            icon={<UI.Icons.FlagOutlined />}
            title="Resign"
            onClick={() => dispatch(['OpenedModal', 'Resign'])}
          />

          <UI.ConformationDialog
            headerIcon={<UI.Icons.FlagOutlined style={{ width: 48, height: 48 }} />}
            onCancel={() => dispatch(['ClosedModal'])}
            onClose={() => dispatch(['ClosedModal'])}
            onConfirm={() => dispatch(['Resign', currentUserColor])}
            open={model.openedModal.type === 'Some' && model.openedModal.value === 'Resign'}
            title="Resign from game?"
            confirmTitle="Resign"
          />

          <UI.Divider orientation="vertical" />
        </>}

        <ViewActionButton
          icon={<UI.Icons.Flip sx={{ 'transform': model.isFlipped ? 'rotate(90deg)' : 'rotate(270deg)' }} />}
          title={model.isFlipped ? "Unflip" : "Flip"}
          onClick={() => {
            dispatch(['ClickedFlip'])
          }}
        />

        <UI.Divider orientation="vertical" />
      </UI.Box>


    </UI.FillBox >
  )
}

const ViewActionButton = ({ title, icon, onClick }: { title: string, icon: UI.Dom; onClick: () => void }) => {
  return (
    <UI.ButtonBase
      onClick={onClick}
      sx={{
        width: 88,
        height: 60,
        display: 'flex',
        flexDirection: "column",
        color: "text.secondary",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {icon}
      <UI.Typography>
        {title}
      </UI.Typography>
    </UI.ButtonBase>
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


      <UI.Typography
        color={isActive ? theme.palette.text.primary : theme.palette.text.disabled}
        variant="h4"
      >
        {formatSeconds(seconds)}
      </UI.Typography>

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
