import { DependencyList, useLayoutEffect, useRef, useState } from "react"
import { Chessboard } from "react-chessboard"
import { Audio, Cmd, exhaustive, Option, pipe, Sub, tag } from "../../../Core"
import { UserId } from "../../../Data"
import * as Store from "../../../Store"
import * as UI from "../../../UI"
import * as Clock from "../Clock"
import * as Sounds from "../Sounds"
import * as Board from "./../Board"
import {
  BackendModel,
  canStartGame,
  FrontendModel,
  FrontendMsg,
  initShared,
  move,
  Move,
  SharedModel,
  ToBackend,
  ToFrontend
} from "./UserVsUser.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }): [FrontendModel, Cmd.Cmd<Msg>] => {
  return [
    {
      sharedModel: initShared,
      openedMenuId: Option.None,
      openedModal: "None",
      isFlipped: false,
    },
    sendToBackend(['Init'])
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
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {

    // 
    //
    // Frontend Only
    //
    // 

    case "Audio_Done": {
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

    // 
    // 
    //
    //
    //
    // 

    case "InputPlayer": {
      return [model, sendToBackend(msg)]
    }

    case "StartGame": {
      return [model, sendToBackend(msg)]
    }

    case 'InputClock': {
      return [model, sendToBackend(msg)]
    }

    case 'RequestToDraw': {
      return [model, sendToBackend(msg)]
    }

    case 'Resign': {
      return [{ ...model, openedModal: "None" }, sendToBackend(msg)]
    }

    case 'RespondToDraw': {
      return [model, sendToBackend(msg)]
    }

    case 'NewGame': {
      return [model, sendToBackend(msg)]
    }

    case "Move": {
      const result = move(msg[1], model.sharedModel)

      if (result.type === 'Err') {
        return [model, Cmd.None]
      }

      return [{ ...model, sharedModel: result.value }, sendToBackend(msg)]
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
      return [
        {
          ...model,
          sharedModel: msg[1]
        },
        Cmd.None
      ]
    }

    case 'InputClock_Done': {
      return [model, Cmd.None]
    }

    case "Moved_Done": {
      if (msg[1].type === 'Err') {
        return [model, Cmd.None]
      }

      const sharedModelNew = msg[1].value

      if (sharedModelNew.type === 'Setup') {
        return [model, Cmd.None]
      }

      const soundCmd =
        Board.inCheck(sharedModelNew.board)
          ? playAudio(Sounds.check)
          : sharedModelNew.didCapture
            ? playAudio(Sounds.capture)
            : playAudio(Sounds.move)

      return [{ ...model, sharedModel: sharedModelNew }, soundCmd]
    }

    case "InputPlayer_Done": {
      if (msg[1].type === 'Err') {
        return [model, Cmd.None]
      }

      const sharedModel = msg[1].value

      return [{ ...model, sharedModel }, Cmd.None]
    }

    case "StartGame_Done": {
      if (msg[1].type === 'Err') {
        return [model, Cmd.None]
      }

      return [model, playAudio(Sounds.gameStart)]
    }

    case 'RequestToDraw_Done': {
      switch (msg[1].type) {
        case 'Err': {
          return [model, Cmd.None]
        }

        case 'Ok': {
          return [{ ...model, openedModal: "AskedToDraw" }, playAudio(Sounds.uiUnlock)]
        }
      }
    }

    case 'Resign_Done': {
      if (msg[1].type === 'Err') {
        return [model, Cmd.None]
      }

      const sharedModelNew = msg[1].value

      if (sharedModelNew.type === 'Setup') {
        return [model, Cmd.None]
      }

      return [{ ...model, sharedModel: sharedModelNew }, Cmd.None]
    }

    case 'RespondToDraw_Done': {
      if (msg[1].type === 'Err') {
        return [model, Cmd.None]
      }

      const sharedModelNew = msg[1].value

      if (sharedModelNew.type === 'Setup') {
        return [model, Cmd.None]
      }


      return [{ ...model, sharedModel: sharedModelNew }, Cmd.None]
    }

    case 'NewGame_Done': {
      if (msg[1].type === 'Err') {
        return [model, Cmd.None]
      }

      const sharedModelNew = msg[1].value

      if (sharedModelNew.type === 'Setup') {
        return [model, playAudio(Sounds.navigationCancel)]
      }

      return [{ ...model, sharedModel: sharedModelNew }, Cmd.None]

    }

    case 'GameOver': {
      return [
        {
          ...model,
          openedModal: "GameOver"
        },
        playAudio(Sounds.gameOver)
      ]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}


const playAudio = (src: string): Cmd.Cmd<Msg> => {
  return Audio.play(src, tag("Audio_Done"))
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
// View
//
//
//

export const View =
  (
    {
      currentUserId,
      store,
      model,
      dispatch,
      onBack,
    }: {
      store: Store.Model
      currentUserId: UserId.UserId
      model: Model,
      dispatch: (msg: Msg) => void
      onBack: () => void
    },

  ) => {
    const { boardWidth, ref } = useBoardWidth([model.sharedModel.type])

    if (model.sharedModel.type === 'Setup') {
      return (
        <UI.FillBox>
          <UI.Box sx={{ paddingX: 2, marginBottom: 2 }}>
            <UI.Button onClick={onBack} variant="contained" startIcon={<UI.Icons.ChevronLeft />} >
              Back
            </UI.Button>
          </UI.Box>

          <UI.Typography sx={{ paddingX: 2, }} color="text.secondary">
            {Board.colorToString('w')}
          </UI.Typography>

          <UI.Box sx={{ height: "72px" }}>
            {model.sharedModel.w.type === 'None' ? (
              <ViewInputPlayerButton currentUserId={currentUserId} dispatch={dispatch} color="w" />
            ) : (
              <ViewInputUserPlayerSlot
                color="w"
                userId={model.sharedModel.w.value}
                currentUserId={currentUserId}
                dispatch={dispatch}
                model={model}
                store={store}
              />
            )}
          </UI.Box>

          <UI.Typography sx={{ paddingX: 2, }} color="text.secondary">
            {Board.colorToString('b')}
          </UI.Typography>

          <UI.Box sx={{ height: "72px" }}>
            {model.sharedModel.b.type === 'None' ? (
              <ViewInputPlayerButton currentUserId={currentUserId} dispatch={dispatch} color="b" />
            ) : (
              <ViewInputUserPlayerSlot
                color="b"
                userId={model.sharedModel.b.value}
                currentUserId={currentUserId}
                dispatch={dispatch}
                model={model}
                store={store}
              />
            )}
          </UI.Box>

          <UI.Typography sx={{ paddingX: 2 }} gutterBottom color={'text.secondary'}>
            Clock
          </UI.Typography>

          <UI.Box sx={{ paddingX: 2 }}>

            <UI.ToggleButtonGroup fullWidth value={model.sharedModel.clockPreset}>
              {Object.values(Clock.presets)
                .map((preset) => (
                  <UI.ToggleButton key={preset} value={preset} onClick={() => dispatch(['InputClock', preset])}>
                    {Clock.presetToString(preset)}
                  </UI.ToggleButton>
                ))}
            </UI.ToggleButtonGroup>
          </UI.Box>

          <UI.Box sx={{ flex: 1 }}></UI.Box>

          <UI.Box sx={{ paddingX: 2, paddingBottom: 1 }}>
            <UI.Button
              disabled={!canStartGame(model.sharedModel)}
              fullWidth
              variant="contained"
              onClick={() => {
                dispatch(['StartGame'])
              }}
            >
              Start Game
            </UI.Button>
          </UI.Box>

        </UI.FillBox>
      )
    }

    const { w, b, board, clock } = model.sharedModel

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

    const whiteSlot: ViewUserPlayerSlotProps = {
      src: store.Profile[w]?.avatarUrl,
      username: store.Profile[w]?.username ?? "...",
      isActive: turn === 'w' && model.sharedModel.type === 'Game',
      seconds: clock.w
    }

    const blackSlot: ViewUserPlayerSlotProps = {
      src: store.Profile[b]?.avatarUrl,
      username: store.Profile[b]?.username ?? "...",
      isActive: turn === 'b' && model.sharedModel.type === 'Game',
      seconds: clock.b,
    }

    const topSlot = boardOrentation === 'w' ? blackSlot : whiteSlot

    const bottomSlot = boardOrentation === 'w' ? whiteSlot : blackSlot


    return (
      <UI.FillBox>
        <UI.Typography color="text.secondary" variant="subtitle2" align="center">
          {toGameText(model.sharedModel)}
        </UI.Typography>

        <ViewUserPlayerSlot position="top" {...topSlot} />

        <div ref={ref}>
          <Chessboard
            showBoardNotation
            snapToCursor
            boardOrientation={boardOrentation === "w" ? "white" : "black"}
            position={Board.toFen(board)}
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

        <ViewUserPlayerSlot position="bottom" {...bottomSlot} />

        <UI.Box sx={{ flex: 1 }} />

        <ViewGameOverDialog model={model} dispatch={dispatch} />



        <UI.Box sx={{ width: "100%", display: "flex" }}>

          {model.sharedModel.type === 'GameOver' && (currentUserColor !== 'None') && (
            <UI.Box sx={{ paddingX: 2, paddingBottom: 2, width: "100%", }}>
              <UI.Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => dispatch(['NewGame'])}
                disabled={!(currentUserColor === 'w' || currentUserColor === 'b')}
              >
                New Game
              </UI.Button>
            </UI.Box>
          )}


          {model.sharedModel.type === 'Game' && (
            <>
              {(currentUserColor === 'w' || currentUserColor === 'b') && <>
                <ViewActionButton
                  icon={<UI.Icons.HandshakeTwoTone />}
                  title="Draw"
                  onClick={() => dispatch(['OpenedModal', 'RequestToDraw'])}
                />

                <UI.ConformationDialog
                  headerIcon={<UI.Icons.HandshakeTwoTone style={{ width: 48, height: 48 }} />}
                  onCancel={() => dispatch(['ClosedModal'])}
                  onClose={() => dispatch(['ClosedModal'])}
                  onConfirm={() => dispatch(['RequestToDraw', currentUserColor])}
                  open={model.openedModal === 'RequestToDraw'}
                  title="Ask for a draw?"
                  confirmTitle="Ask"
                />

                <UI.LoadingDialog
                  open={model.sharedModel.type === 'Game' && model.sharedModel.drawAgreement.type === 'Asking' && model.sharedModel.drawAgreement.asker === currentUserColor}
                  title="Waiting on response..."
                />

                <UI.ConformationDialog
                  open={(model.sharedModel.type === 'Game') && (model.sharedModel.drawAgreement.type === 'Asking') && (model.sharedModel.drawAgreement.asker === Board.toOppositeColor(currentUserColor))}
                  headerIcon={<UI.Icons.HandshakeTwoTone style={{ width: 48, height: 48 }} />}
                  onClose={() => dispatch(['RespondToDraw', 'Declined'])}
                  onCancel={() => dispatch(['RespondToDraw', 'Declined'])}
                  onConfirm={() => dispatch(['RespondToDraw', 'Accepted'])}
                  title="Agree to a draw?"
                  confirmTitle="Accept"
                  cancelTitle="Decline"
                />

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
              </>}

              <ViewActionButton
                icon={<UI.Icons.Flip sx={{ 'transform': model.isFlipped ? 'rotate(90deg)' : 'rotate(270deg)' }} />}
                title={model.isFlipped ? "Unflip" : "Flip"}
                onClick={() => {
                  dispatch(['ClickedFlip'])
                }}
              />
            </>
          )}



        </UI.Box>


      </UI.FillBox >
    )
  }

const ViewGameOverDialog = ({ model, dispatch }: { model: Model, dispatch: (msg: Msg) => void }) => {
  if (model.sharedModel.type === 'Setup') {
    return <></>
  }

  if (model.sharedModel.type === 'Game') {
    return <></>
  }

  return (
    <UI.Dialog open={model.openedModal === 'GameOver'} onClose={() => dispatch(['ClosedModal'])}>
      <UI.DialogTitle>
        {toGameText(model.sharedModel)}
      </UI.DialogTitle>
      <UI.DialogActions>
        <UI.Button onClick={() => dispatch(['ClosedModal'])}>
          Close
        </UI.Button>
      </UI.DialogActions>
    </UI.Dialog>
  )

}

const ViewInputUserPlayerSlot = ({
  dispatch,
  store,
  userId,
  model,
  currentUserId,
  color
}: {

  dispatch: (msg: Msg) => void,
  store: Store.Model,
  userId: UserId.UserId,
  model: Model,
  currentUserId: UserId.UserId
  color: Board.Color
}) => {
  const anchorId = `${color}-${userId}`
  return (
    <>
      <UI.ListItemButton id={anchorId} onClick={() => dispatch(['OpenedMenu', anchorId])}>
        <UI.ListItemAvatar>
          <UI.Avatar src={store.Profile[userId]?.avatarUrl} />
        </UI.ListItemAvatar>
        <UI.ListItemText primary={store.Profile[userId]?.username ?? "..."} />
        <UI.ListItemSecondaryAction>
          <UI.Icons.MoreVert />
        </UI.ListItemSecondaryAction>
      </UI.ListItemButton>

      <UI.Menu
        anchorEl={document.getElementById(anchorId)}
        open={model.openedMenuId.type === 'Some' && model.openedMenuId.value === anchorId}
        onClose={() => dispatch(['ClosedMenu'])}
      >
        {userId === currentUserId ? (
          <UI.Button
            size="large"
            onClick={() => dispatch(['InputPlayer', { userId: Option.None, color }])}
          >
            Stop Playing
          </UI.Button>
        ) : (
          <UI.MenuItem >
            <UI.ListItemText
              primaryTypographyProps={{
                color: "text.secondary"
              }}
              primary="Not action available"
            />
          </UI.MenuItem>
        )}

      </UI.Menu>
    </>
  )
}

const ViewInputPlayerButton = ({ dispatch, currentUserId, color }: { color: Board.Color, dispatch: (msg: Msg) => void, currentUserId: UserId.UserId }) => {
  return (
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
        Play As {Board.colorToString(color)}
      </UI.Button>
    </UI.Box>
  )
}

const toGameText = (model: SharedModel): string => {
  switch (model.type) {
    case 'GameOver': {
      switch (model.gameOver.type) {
        case 'Checkmate': {
          return `${Board.colorToString(model.gameOver.winner)} won by checkmate`
        }

        case 'DrawByAgreement': {
          return "Drawed by agreement"
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

        default:
          return exhaustive(model.gameOver)
      }
    }

    case 'Setup': {
      return "Setting up game"
    }

    case 'Game': {
      if (Board.inCheck(model.board)) {
        return `${Board.colorToString(Board.toTurn(model.board))} is in check`
      }

      return `${Board.colorToString(Board.toTurn(model.board))}'s turn`
    }

    default:
      return exhaustive(model)
  }
}


const ViewActionButton = ({ title, icon, onClick }: { title: string, icon: UI.Dom; onClick: () => void }) => {
  const theme = UI.useTheme()
  return (
    <UI.ButtonBase
      onClick={onClick}
      sx={{
        width: 72,
        height: 54,
        display: 'flex',
        flexDirection: "column",
        color: theme.palette.action.active,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {icon}
      <UI.Typography variant="body2">
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


type ViewUserPlayerSlotProps = {
  src?: string
  username: string
  isActive: boolean
  seconds: Clock.Seconds,
}

const ViewUserPlayerSlot = ({ position, src, username, isActive, seconds }: ViewUserPlayerSlotProps & { position: "top" | "bottom" }) => {
  const theme = UI.useTheme()
  return (
    <UI.Box
      sx={{
        paddingX: 2,
        paddingTop: position === 'bottom' ? 1 : 0,
        paddingBottom: position === 'top' ? 1 : 0,
        display: "flex",
        alignItems: "center",
      }}>
      <UI.Avatar
        src={src}
        sx={{
          marginRight: 1,
        }}
      />
      <UI.Typography variant="body2">
        {username}
      </UI.Typography>

      <UI.Box sx={{ flex: 1 }} />

      <UI.Typography
        color={isActive ? theme.palette.text.primary : theme.palette.action.disabled}
        variant="h4"
        component="div"
      >
        {Clock.formatSeconds(seconds)}
      </UI.Typography>

    </UI.Box>
  )
}

// 
// 
// 
// 
// 
// 
// 


export const mergeWithBackend = (frontendModel: FrontendModel, backendModel: BackendModel): FrontendModel => {
  return {
    isFlipped: frontendModel.isFlipped,
    openedMenuId: frontendModel.openedMenuId,
    openedModal: frontendModel.openedModal,
    sharedModel: backendModel.sharedModel
  }
}