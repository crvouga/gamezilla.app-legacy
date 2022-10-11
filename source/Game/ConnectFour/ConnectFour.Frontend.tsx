import { Cmd } from "../../Core"
import { UserId } from "../../Data"
import * as UI from "../../UI"
import { GameModeCard } from "../Views"
import {
  COLUMN_COUNT,
  MAX_COLUMN_HEIGHT,
  theme
} from "./ConnectFour"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend
} from "./ConnectFour.Types"
import * as UserVsUser from "./UserVsUser/UserVsUser.Frontend"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: Model = { type: "None" }

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'InputMode': {
      return [model, sendToBackend(msg)]
    }
    case 'UserVsUser': {
      return [model, Cmd.None]
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'InputMode_Done': {
      const merged = mergeWithBackend({ frontendModel: model, backendModel: msg[1] })
      return [merged, Cmd.None]
    }

    case 'UserVsUser': {
      return [model, Cmd.None]
    }
  }
}

//
//
//
// View
//
//
//

const iconSize = 58
const iconSx: UI.Sx = { width: iconSize, height: iconSize }

export const View = ({
  model,
  dispatch,
  goHome,
  closeGame,
  roomComponent,
  currentUserId
}: {
  model: Model
  dispatch: (msg: Msg) => void
  closeGame: () => void
  goHome: () => void
  roomComponent: UI.ViewNode
  currentUserId: UserId.UserId
}) => {
  switch (model.type) {
    case 'None': {
      const ids = {
        playerOneGradient: "playerOneGradient",
        playerTwoGradient: "playerTwoGradient",
        holePattern: "holePattern",
        columnGradient: "columnGradient",
        holeMask: "holeMask",
      }

      const playerOneFill = `url(#${ids.playerOneGradient})`
      const playerTwoFill = `url(#${ids.playerTwoGradient})`

      const columns = [
        ["PlayerOne",],
        ["PlayerTwo", "PlayerOne",],
        ["PlayerOne", "PlayerTwo", "PlayerOne",],
        ["PlayerOne", "PlayerTwo"],
        ["PlayerTwo",],
        ["PlayerOne", "PlayerTwo", "PlayerTwo"],
        ["PlayerTwo"],
      ]

      return (
        <UI.FillBox>
          <UI.Header
            left={
              <UI.IconButton
                sx={{ marginLeft: -1 }}
                onClick={goHome}
              >
                <UI.Icons.Home />
              </UI.IconButton>
            }
            title="Connect Four"
            right={roomComponent}
          />

          <UI.Box sx={{ width: "100%", position: "relative", overflow: "hidden" }}>
            <svg
              width="100%"
              height="100%"
              style={{ padding: 0, margin: 0 }}
              viewBox={"0 0 7 3"}
            >
              <defs>
                <pattern
                  id={ids.holePattern}
                  patternUnits="userSpaceOnUse"
                  width={1}
                  height={1}
                >
                  <circle
                    cx={0.5}
                    cy={0.5}
                    r={0.425}
                    fill="black"
                  ></circle>
                </pattern>

                <mask id={ids.holeMask}>
                  <rect
                    x={0}
                    y={0}
                    width={COLUMN_COUNT}
                    height={MAX_COLUMN_HEIGHT}
                    fill="white"
                  ></rect>
                  <rect
                    x={0}
                    y={0}
                    width={COLUMN_COUNT}
                    height={MAX_COLUMN_HEIGHT}
                    fill={`url(#${ids.holePattern})`}
                  ></rect>
                </mask>

                <linearGradient
                  id={ids.columnGradient}
                  gradientTransform="rotate(90)"
                >
                  <stop
                    offset="0%"
                    stopColor={theme.primary.light}
                  />
                  <stop
                    offset="100%"
                    stopColor={theme.primary.dark}
                  />
                </linearGradient>

                <linearGradient
                  id={ids.playerOneGradient}
                  gradientTransform="rotate(90)"
                >
                  <stop
                    offset="0%"
                    stopColor={theme.playerOne.light}
                  />
                  <stop
                    offset="100%"
                    stopColor={theme.playerOne.dark}
                  />
                </linearGradient>

                <linearGradient
                  id={ids.playerTwoGradient}
                  gradientTransform="rotate(90)"
                >
                  <stop
                    offset="0%"
                    stopColor={theme.playerTwo.light}
                  />
                  <stop
                    offset="100%"
                    stopColor={theme.playerTwo.dark}
                  />
                </linearGradient>
              </defs>

              <rect
                x={0}
                y={0}
                width={7}
                height={3}
                fill={theme.primary.darker}
              />


              {columns.map((column, columnIndex) =>
                column.map((player, rowIndex) => (
                  <circle
                    key={[columnIndex, rowIndex].join(", ")}
                    cx={columnIndex + 0.5}
                    cy={3 - (rowIndex + 0.5)}
                    r={0.5}
                    fill={player === "PlayerOne" ? playerOneFill : playerTwoFill}
                  />
                )),
              )}

              <rect
                x={0}
                y={0}
                width={7}
                height={3}
                fill={`url(#${ids.columnGradient})`}
                mask={`url(#${ids.holeMask})`}
              />
            </svg>

            <UI.Box sx={{ width: '100%', height: '100%', background: "rgba(0, 0, 0, 0.2)", position: "absolute", top: 0, left: 0, overflow: "hidden", display: 'flex', alignItems: "flex-end" }}>
              <UI.Typography color="#fff" fontSize={36} sx={{ paddingX: 2, paddingY: 1 }}>
                Connect Four
              </UI.Typography>
            </UI.Box>

          </UI.Box>

          <UI.Box sx={{ display: "flex", gap: 2, padding: 2, flex: 1 }}>
            <UI.Box sx={{ width: "50%" }}>
              <GameModeCard
                leftIcon={<UI.Icons.Person sx={iconSx} />}
                rightIcon={<UI.Icons.Person sx={iconSx} />}
                title="Vs User"
                onClick={() => dispatch(["InputMode", { mode: "UserVsUser", userId: currentUserId },])}
              />
            </UI.Box>


            <UI.Box sx={{ width: "50%" }}>
              <GameModeCard
                leftIcon={<UI.Icons.Person sx={iconSx} />}
                rightIcon={<UI.Icons.SmartToy sx={iconSx} />}
                title="Vs User"
                onClick={() => dispatch(["InputMode", { mode: "UserVsBot", userId: currentUserId },])}
              />
            </UI.Box>
          </UI.Box>
          <UI.Box sx={{ padding: 2 }}>
            <UI.Button fullWidth onClick={closeGame} variant="outlined">
              Back
            </UI.Button>

          </UI.Box>

        </UI.FillBox>
      )
    }

    case 'UserVsUser': {
      return (
        <UserVsUser.View dispatch={msg => dispatch(['UserVsUser', msg])} goBack={() => dispatch(['InputMode', { userId: currentUserId, mode: "None" }])} goHome={goHome} model={model.child} roomComponent={roomComponent} />
      )
    }

    case 'UserVsBot': {
      return (
        <UI.FillBox>
          <UI.Header
            left={
              <UI.IconButton
                sx={{ marginLeft: -1 }}
                onClick={goHome}
              >
                <UI.Icons.Home />
              </UI.IconButton>
            }
            title="Connect Four"
          />

        </UI.FillBox>
      )
    }
  }
}

//
//
//
// Cover Art
//
//
//

export const CoverArt = ({ id }: { id: string }) => {
  const ids = {
    playerOneGradient: `${id}-playerOneGradient`,
    playerTwoGradient: `${id}-playerTwoGradient`,
    holePattern: `${id}-holePattern`,
    columnGradient: `${id}-columnGradient`,
    holeMask: `${id}-holeMask`,
  }

  const playerOneFill = `url(#${ids.playerOneGradient})`
  const playerTwoFill = `url(#${ids.playerTwoGradient})`

  return (
    <svg
      width="100%"
      viewBox={"0 0 2 2"}
    >
      <defs>
        <pattern
          id={ids.holePattern}
          patternUnits="userSpaceOnUse"
          width={1}
          height={1}
        >
          <circle
            cx={0.5}
            cy={0.5}
            r={0.425}
            fill="black"
          ></circle>
        </pattern>

        <mask id={ids.holeMask}>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill="white"
          ></rect>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill={`url(#${ids.holePattern})`}
          ></rect>
        </mask>

        <linearGradient
          id={ids.columnGradient}
          gradientTransform="rotate(90)"
        >
          <stop
            offset="0%"
            stopColor={theme.primary.light}
          />
          <stop
            offset="100%"
            stopColor={theme.primary.dark}
          />
        </linearGradient>

        <linearGradient
          id={ids.playerOneGradient}
          gradientTransform="rotate(90)"
        >
          <stop
            offset="0%"
            stopColor={theme.playerOne.light}
          />
          <stop
            offset="100%"
            stopColor={theme.playerOne.dark}
          />
        </linearGradient>

        <linearGradient
          id={ids.playerTwoGradient}
          gradientTransform="rotate(90)"
        >
          <stop
            offset="0%"
            stopColor={theme.playerTwo.light}
          />
          <stop
            offset="100%"
            stopColor={theme.playerTwo.dark}
          />
        </linearGradient>
      </defs>

      <rect
        x={0}
        y={0}
        width={2}
        height={2}
        fill={theme.primary.darker}
      />

      <circle
        cx={0.5}
        cy={0}
        r={0.5}
        fill={playerOneFill}
      />

      <circle
        cx={1.5}
        cy={0.5}
        r={0.5}
        fill={playerTwoFill}
      />

      <circle
        cx={1.5}
        cy={1.5}
        r={0.5}
        fill={playerOneFill}
      />

      <circle
        cx={0.5}
        cy={1.5}
        r={0.5}
        fill={playerTwoFill}
      />

      <rect
        x={0}
        y={0}
        width={COLUMN_COUNT}
        height={MAX_COLUMN_HEIGHT}
        fill={`url(#${ids.columnGradient})`}
        mask={`url(#${ids.holeMask})`}
      />
    </svg>
  )
}

export const mergeWithBackend = (
  {
    frontendModel,
    backendModel
  }: {
    frontendModel: FrontendModel,
    backendModel: BackendModel,
  }
): FrontendModel => {
  switch (backendModel.type) {
    case 'None': {
      return backendModel
    }

    case 'UserVsBot': {
      return { type: "UserVsBot" }
    }

    case 'UserVsUser': {

      if (frontendModel.type === 'UserVsUser') {
        return backendModel
      }

      return backendModel
    }
  }

}
