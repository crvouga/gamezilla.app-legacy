import { Cmd } from "../../Core"
import { UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import { Position, Slot, theme, ViewBoard, ViewSlot } from "./TicTacToe"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  initSharedModel,
  startGame,
  ToBackend,
  toGameOver,
  ToFrontend,
} from "./TicTacToe.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: Model = {
  ...initSharedModel,
  openedModal: "None",
}

//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = Store.Action

export const update = (
  {
    currentUserId,
    sendToBackend,
  }: {
    currentUserId: UserId.UserId
    sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
  },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    //
    //
    //
    // Frontend Msg
    //
    //

    case "CloseModal": {
      return [{ ...model, openedModal: "None" }, Cmd.None]
    }

    case "OpenModal": {
      return [{ ...model, openedModal: msg[1] }, Cmd.None]
    }

    //
    //
    //
    // Request Msg
    //
    //
    //

    case "InputMove": {
      return [model, sendToBackend(msg)]
    }

    case "Resign": {
      return [model, sendToBackend(msg)]
    }

    case "InputPlayer": {
      return [model, sendToBackend(msg)]
    }

    case "StopPlaying": {
      return [model, sendToBackend(msg)]
    }

    case "StartGame": {
      return [model, sendToBackend(msg)]
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  modelPrev: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const [modelNext, cmd] = updateFromBackend_(msg, modelPrev)

  const gameOverPrev = toGameOver(modelPrev)
  const gameOverNext = toGameOver(modelNext)

  if (gameOverPrev.type === "None" && gameOverNext.type !== "None") {
    // game over logic
  }

  return [modelNext, cmd]
}

export const updateFromBackend_ = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMove_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const sharedModel = msg[1].value

      return [{ ...sharedModel, openedModal: model.openedModal }, Cmd.None]
    }

    case "InputPlayer_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const sharedModel = msg[1].value

      return [{ ...sharedModel, openedModal: model.openedModal }, Cmd.None]
    }

    case "StopPlaying_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const sharedModel = msg[1].value

      return [{ ...sharedModel, openedModal: model.openedModal }, Cmd.None]
    }

    case "StartGame_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const sharedModel = msg[1].value

      return [{ ...sharedModel, openedModal: model.openedModal }, Cmd.None]
    }

    case "Resign_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const sharedModel = msg[1].value

      return [{ ...sharedModel, openedModal: model.openedModal }, Cmd.None]
    }
  }
}

export const mergeWithBackend = (
  frontendModel: FrontendModel,
  backendModel: BackendModel,
): FrontendModel => {
  return {
    ...backendModel,
    openedModal: frontendModel.openedModal,
  }
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
  dispatch,
  onCloseGame,
  onBack,
  roomAvatarGroup,
}: {
  currentUserId: UserId.UserId
  store: Store.Model
  model: Model
  dispatch: (msg: Msg) => void
  onCloseGame: () => void
  onBack: () => void
  roomAvatarGroup: UI.ViewNode
}) => {
  const header = (
    <UI.Header
      left={
        <UI.IconButton
          sx={{ marginLeft: -1 }}
          onClick={onBack}
        >
          <UI.Icons.Home />
        </UI.IconButton>
      }
      title="Tic Tac Toe"
      right={roomAvatarGroup}
    />
  )

  if (model.type === "Setup") {
    const startGameResult = startGame({ userId: currentUserId }, model)
    return (
      <UI.FillBox>
        {header}

        <UI.Box sx={{ flex: 1, padding: 2 }}>
          <UI.Typography
            color="text.secondary"
            sx={{ marginBottom: 1 }}
          >
            Player One •{" "}
            <UI.Box
              component="span"
              sx={{ fontFamily: "Roboto Mono" }}
            >
              X
            </UI.Box>
          </UI.Typography>

          {model.players.X === "None" ? (
            <UI.Button
              fullWidth
              variant="contained"
              onClick={() =>
                dispatch([
                  "InputPlayer",
                  { userId: currentUserId, playerType: "X" },
                ])
              }
            >
              Play as X
            </UI.Button>
          ) : (
            <ViewPlayerSlot
              currentUserId={currentUserId}
              userId={model.players.X}
              store={store}
              dispatch={dispatch}
            />
          )}

          <UI.Typography
            color="text.secondary"
            sx={{ marginTop: 2, marginBottom: 1 }}
          >
            Player Two •{" "}
            <UI.Box
              component="span"
              sx={{ fontFamily: "Roboto Mono" }}
            >
              O
            </UI.Box>
          </UI.Typography>

          {model.players.O === "None" ? (
            <UI.Button
              fullWidth
              variant="contained"
              onClick={() =>
                dispatch([
                  "InputPlayer",
                  { userId: currentUserId, playerType: "O" },
                ])
              }
            >
              Play as O
            </UI.Button>
          ) : (
            <ViewPlayerSlot
              currentUserId={currentUserId}
              userId={model.players.O}
              store={store}
              dispatch={dispatch}
            />
          )}
        </UI.Box>

        <UI.Box sx={{ padding: 2, display: "flex", gap: 2 }}>
          <UI.Button
            variant="outlined"
            fullWidth
            onClick={onCloseGame}
          >
            Close
          </UI.Button>
          <UI.Button
            variant="contained"
            fullWidth
            onClick={() => dispatch(["StartGame", { userId: currentUserId }])}
            disabled={startGameResult.type === "Err"}
          >
            Start
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    )
  }

  return (
    <UI.FillBox>
      {header}

      <UI.Box sx={{ display: "flex", gap: 2, paddingX: 2 }}>
        <UI.Box
          sx={{ flex: 1, display: "flex", alignItems: "center", paddingY: 1 }}
        >
          <UI.Avatar src={store.Profile[model.players.X]?.avatarUrl} />
          <UI.Typography>
            {store.Profile[model.players.X]?.username ?? "..."}
          </UI.Typography>
        </UI.Box>

        <UI.Box
          sx={{ flex: 1, display: "flex", alignItems: "center", paddingY: 1 }}
        >
          <UI.Avatar src={store.Profile[model.players.O]?.avatarUrl} />
          <UI.Typography>
            {store.Profile[model.players.O]?.username ?? "..."}
          </UI.Typography>
        </UI.Box>
      </UI.Box>

      <ViewBoard
        board={model.board}
        onClick={(position) =>
          dispatch(["InputMove", { position, userId: currentUserId }])
        }
      />

      <UI.Box sx={{ flex: 1 }} />

      <UI.Box sx={{ display: "flex" }}>
        <UI.ActionButton
          icon={<UI.Icons.Flag />}
          label="Resign"
          onClick={() => dispatch(["OpenModal", "Resignation"])}
        />
        <UI.ConformationDialog
          open={model.openedModal === "Resignation"}
          onCancel={() => dispatch(["CloseModal"])}
          onClose={() => dispatch(["CloseModal"])}
          onConfirm={() => dispatch(["Resign", { userId: currentUserId }])}
          headerIcon={<UI.Icons.Flag sx={{ width: 64, height: 64 }} />}
          title="Resign from game?"
          confirmTitle="Resign"
        />
      </UI.Box>
    </UI.FillBox>
  )
}

const ViewPlayerSlot = ({
  currentUserId,
  store,
  userId,
  dispatch,
}: {
  currentUserId: UserId.UserId
  userId: UserId.UserId
  store: Store.Model
  dispatch: (msg: Msg) => void
}) => {
  return (
    <UI.Box sx={{ display: "flex", alignItems: "center" }}>
      <UI.Avatar
        src={store.Profile[userId]?.avatarUrl}
        sx={{ marginRight: 1 }}
      />
      <UI.Typography sx={{ flex: 1 }}>
        {store.Profile[userId]?.username ?? "..."}
      </UI.Typography>
      {currentUserId === userId && (
        <UI.Button
          onClick={() => dispatch(["StopPlaying", { userId: currentUserId }])}
        >
          Stop Playing
        </UI.Button>
      )}
    </UI.Box>
  )
}

const ViewPlayerGameSlot = ({
  store,
  model,
}: {
  store: Store.Model
  model: Model
}) => {
  if (model.type !== "Game") {
    return <></>
  }

  return (
    <UI.Box
      sx={{ flex: 1, display: "flex", alignItems: "center", paddingY: 1 }}
    >
      <UI.Avatar src={store.Profile[model.players.O]?.avatarUrl} />
      <UI.Typography>
        {store.Profile[model.players.O]?.username ?? "..."}
      </UI.Typography>
    </UI.Box>
  )
}

export const CoverArt = () => {
  const positions: [Position, Slot][] = [
    [{ row: 0, column: 0 }, "X"],
    [{ row: 0, column: 1 }, "Empty"],
    [{ row: 1, column: 0 }, "Empty"],
    [{ row: 1, column: 1 }, "O"],
  ]

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const

  return (
    <svg
      width="100%"
      viewBox="0 0 2 2"
    >
      <rect
        x={0}
        y={0}
        width={2}
        height={2}
        fill={theme.background}
      />

      {LINES.map((line, index) => (
        <line
          key={index}
          {...line}
          stroke={theme.line}
          strokeWidth={0.1}
        />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <ViewSlot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  )
}
