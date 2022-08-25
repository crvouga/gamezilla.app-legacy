import { DependencyList, useLayoutEffect, useRef, useState } from "react"
import { Chessboard } from "react-chessboard"
import * as Bridge from "../../Bridge"
import { andThen, Audio, Cmd, exhaustive, Option, pipe, Sub, tag } from "../../Core"
import { RoomId, UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import * as Board from "./Board"
import * as Clock from "./Clock"
import {
  canStartGame,
  FrontendModel,
  FrontendMsg,
  GameOver,
  initSharedModel,
  move,
  Move,
  SharedModel,
  ToBackend,
  ToFrontend,
} from "./Chess.Types"
import * as Sounds from "./Sounds/Sounds"

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
      openedModal: "None",
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
  return pipe(
    [model, Cmd.None],
    andThen(updateMain({ currentRoomId }), msg)
  )
}

export const updateMain = (
  { currentRoomId }: { currentRoomId: RoomId.RoomId }
) => (
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
        return [{ ...model, openedModal: "None" }, sendToBackend(currentRoomId, msg)]
      }

      case 'RespondToDraw': {
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

      case 'ClickedFlip': {
        return [{ ...model, isFlipped: !model.isFlipped }, Cmd.None]
      }

      case 'OpenedModal': {
        return [{ ...model, openedModal: (msg[1]) }, Cmd.None]
      }

      case 'ClosedModal': {
        return [{ ...model, openedModal: "None" }, Cmd.None]
      }


      case "Move": {
        const result = move(msg[1], model.sharedModel)

        if (result.type === "Err") {
          return [model, Cmd.None]
        }

        const sharedModelNew = result.value

        if (sharedModelNew.type === 'GameSetup') {
          return [model, Cmd.None]
        }

        const sound = Board.inCheck(sharedModelNew.board) ? Sounds.check : Sounds.move

        const changed = updateChanged(model, {
          ...model,
          sharedModel: sharedModelNew,
        })

        return [
          changed[0],
          Cmd.batch([
            changed[1],
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
      return updateChanged(model, {
        ...model,
        sharedModel: msg[1]
      })
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
          return [{ ...model, openedModal: ("AskedToDraw") }, Cmd.None]
        }
      }
    }

    case 'ResignResulted': {
      return [{ ...model, }, Cmd.None]
    }

    case 'RespondToDrawResulted': {
      return [{ ...model, }, Cmd.None]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

const updateChanged = (prev: Model, next: Model): [Model, Cmd.Cmd<Msg>] => {
  if (prev.sharedModel.type === next.sharedModel.type) {
    return [next, Cmd.None]
  }

  switch (next.sharedModel.type) {
    case 'GameEnded': {
      return [
        { ...next, openedModal: 'GameOver' },
        pipe(
          Audio.play(Sounds.gameOver),
          Cmd.perform(tag('AudioResulted'))
        ),
      ]
    }

    case 'GameSetup': {
      return [next, Cmd.None]
    }

    case 'GameStarted': {
      return [
        next,
        pipe(
          Audio.play(Sounds.gameStart),
          Cmd.perform(tag('AudioResulted'))
        ),
      ]
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
      return <View store={store} currentUserId={currentUserId} model={model} dispatch={dispatch} />
    }

const View =
  (
    {
      currentUserId,
      store,
      model,
      dispatch,
    }: {
      store: Store.Model
      currentUserId: UserId.UserId
      model: Model,
      dispatch: (msg: Msg) => void
    },
  ) => {
    const { boardWidth, ref } = useBoardWidth([model.sharedModel.type])

    if (model.sharedModel.type === 'GameSetup') {
      return (
        <UI.FillBox >
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
              {Object.values(Clock.presets)
                .map((preset) => (
                  <UI.MenuItem
                    key={preset}
                    value={preset}
                    onClick={() => dispatch(['InputClock', preset])}
                  >
                    {Clock.presetToString(preset)}
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

    const { w, b, board, clock, } = model.sharedModel

    const currentUserColor: Board.Color | "None" | "Both" =
      currentUserId === w && currentUserId === b
        ? "Both"
        : currentUserId === w
          ? 'w'
          : currentUserId === b
            ? 'b'
            : "None"



    const boardOrentation: Board.Color = pipe(
      currentUserColor === 'None' || currentUserColor === 'Both'
        ? 'w'
        : currentUserColor,
      color => model.isFlipped ? Board.toOppositeColor(color) : color
    )

    const turn = Board.toTurn(board)

    const whiteSlot: GameStartedPlayerSlot = {
      src: store.Profile[w]?.avatarUrl,
      username: store.Profile[w]?.username ?? "...",
      isActive: turn === 'w' && model.sharedModel.type === 'GameStarted',
      seconds: clock.w
    }

    const blackSlot: GameStartedPlayerSlot = {
      src: store.Profile[b]?.avatarUrl,
      username: store.Profile[b]?.username ?? "...",
      isActive: turn === 'b' && model.sharedModel.type === 'GameStarted',
      seconds: clock.b
    }

    const topSlot = boardOrentation === 'w' ? blackSlot : whiteSlot

    const bottomSlot = boardOrentation === 'w' ? whiteSlot : blackSlot


    return (
      <UI.FillBox>
        <UI.Typography color="text.secondary" align="center">
          {toGameText(model.sharedModel)}
        </UI.Typography>
        <ViewGameStartedPlayerSlot slot={topSlot} />

        <div ref={ref}>
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

        <ViewGameOverDialog model={model} dispatch={dispatch} />

        <UI.Divider />

        <UI.Box sx={{ width: "100%", display: "flex" }}>
          {model.sharedModel.type === 'GameStarted'
            && (currentUserColor === 'w' || currentUserColor === 'b')
            && (
              <>
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
                  open={model.openedModal === 'AskToDraw'}
                  title="Ask to draw?"
                  confirmTitle="Ask"
                />

                <UI.LoadingDialog
                  open={model.sharedModel.type === 'GameStarted' && model.sharedModel.drawAgreement.type === 'Asking' && model.sharedModel.drawAgreement.asker === currentUserColor}
                  title="Waiting on other player..."
                />

                <UI.ConformationDialog
                  open={(model.sharedModel.type === 'GameStarted') && (model.sharedModel.drawAgreement.type === 'Asking') && (model.sharedModel.drawAgreement.asker === Board.toOppositeColor(currentUserColor))}
                  headerIcon={<UI.Icons.HandshakeTwoTone style={{ width: 48, height: 48 }} />}
                  onClose={() => dispatch(['RespondToDraw', 'Declined'])}
                  onCancel={() => dispatch(['RespondToDraw', 'Declined'])}
                  onConfirm={() => dispatch(['RespondToDraw', 'Accepted'])}
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
                  open={model.openedModal === 'Resign'}
                  title="Resign from game?"
                  confirmTitle="Resign"
                />

                <UI.Divider orientation="vertical" />
              </>
            )}

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

const ViewGameOverDialog = ({ model, dispatch }: { model: Model, dispatch: (msg: Msg) => void }) => {
  if (model.sharedModel.type === 'GameSetup') {
    return <></>
  }

  if (model.sharedModel.type === 'GameStarted') {
    return <></>
  }

  const gameOver = model.sharedModel.gameOver

  return <UI.Dialog open={model.openedModal === 'GameOver'} onClose={() => dispatch(['ClosedModal'])}>
    <ViewGameOverDialogContent gameOver={gameOver} />
    <UI.DialogActions>
      <UI.Button onClick={() => dispatch(['ClosedModal'])}>
        Close
      </UI.Button>
    </UI.DialogActions>
  </UI.Dialog>

}

const ViewGameOverDialogContent = ({ gameOver }: { gameOver: GameOver }) => {

  switch (gameOver.tag) {
    case 'Checkmate': {
      return <>
        <UI.DialogTitle>
          {Board.colorToString(gameOver.winner)} checkmated {Board.colorToString(Board.toOppositeColor(gameOver.winner))}
        </UI.DialogTitle>
      </>
    }

    case 'DrawByAgreement': {
      return <>
        <UI.DialogTitle>
          Drawed by agreement
        </UI.DialogTitle>
      </>
    }

    case 'Resignation': {
      return <>
        <UI.DialogTitle>
          {Board.colorToString(gameOver.resigner)} resigned
        </UI.DialogTitle>
      </>
    }

    case 'Stalemate': {
      return <></>
    }

    case 'WinOnTime': {
      return <>
        <UI.DialogTitle>
          {Board.colorToString(gameOver.winner)} won on time
        </UI.DialogTitle>
      </>
    }
  }
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



const toGameText = (model: SharedModel): string => {

  switch (model.type) {
    case 'GameEnded': {
      switch (model.gameOver.tag) {
        case 'Checkmate': {
          return "Checkmate"
        }

        case 'DrawByAgreement': {
          return "Draw by agreement"
        }


        case 'Resignation': {
          return `${Board.colorToString(model.gameOver.resigner)} resigned`
        }

        case 'Stalemate': {
          return 'Stalemate'
        }

        case 'WinOnTime': {
          return `${Board.colorToString(model.gameOver.winner)} won on time`
        }
      }
    }
    case 'GameSetup': {
      return "Waiting for game to start..."
    }

    case 'GameStarted': {

      if (Board.inCheck(model.board)) {
        return `${Board.colorToString(Board.toTurn(model.board))} is in check`
      }

      return `${Board.colorToString(Board.toTurn(model.board))} turn`
    }
  }
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

const useBoardWidth = (depList: DependencyList) => {
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
  }, depList)

  return {
    ref,
    boardWidth
  }
}


type GameStartedPlayerSlot = {
  src?: string
  username: string
  isActive: boolean
  seconds: Clock.Seconds
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
        color={isActive ? theme.palette.text.primary : theme.palette.action.disabled}
        variant="h4"
      >
        {Clock.formatSeconds(seconds)}
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
