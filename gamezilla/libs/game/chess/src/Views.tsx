import { UserId } from "@gamezilla/shared"
import * as UI from "@gamezilla/ui"
import { bannerArtAspectRatio } from "@gamezilla/game-shared"
import { Ctx } from "@gamezilla/shared"

export const theme = {
  lightSquare: "#EBEBD0",
  darkSquare: "#779455",
  // lightSquare: "#7C6141",
  // darkSquare: "#533F30",
  pawn: "#93BA46",
}

export const toChecker = ({
  x,
  y,
}: {
  x: number
  y: number
}): "Light" | "Dark" => {
  if ((isEven(x) && isOdd(y)) || (isOdd(x) && isEven(y))) {
    return "Light"
  }
  return "Dark"
}
const isEven = (x: number) => x % 2 === 0
const isOdd = (x: number) => !isEven(x)

export const BannerArt = ({ title }: { title: string }) => {
  const columnCount = 8
  const rowCount = 4
  return (
    <UI.AspectRatio aspectRatio={bannerArtAspectRatio}>
      <UI.Box sx={{ width: "100%", position: "relative" }}>
        <svg
          width="100%"
          height="100%"
          viewBox={[0, 0, columnCount, rowCount].join(" ")}
        >
          {[...Array(columnCount)].map((_, x) =>
            [...Array(rowCount)].map((_, y) => (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={
                  toChecker({ x, y }) === "Light"
                    ? theme.lightSquare
                    : theme.darkSquare
                }
              />
            )),
          )}
        </svg>
      </UI.Box>

      <UI.Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
          <g
            transform="translate(0 -2) scale(1)"
            style={{ transformOrigin: "center" }}
          >
            <path
              fill={theme.pawn}
              stroke={theme.pawn}
              strokeLinecap="round"
              strokeWidth="1.5"
              d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            ></path>
          </g>
        </svg>
      </UI.Box>

      <UI.Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "rgba(0, 0, 0, 0.4)",
          // background: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3))`,
        }}
      >
        <UI.Box sx={{ flex: 1 }} />
        <UI.Typography
          sx={{ paddingX: 2, paddingBottom: 1 }}
          variant="h3"
          color="#fff"
        >
          {title}
        </UI.Typography>
      </UI.Box>
    </UI.AspectRatio>
  )
}

type Player =
  | { type: "none" }
  | { type: "User"; userId: UserId }
  | { type: "Bot"; label: string }

export const VersusHeader = ({
  ctx,
  white,
  black,
}: {
  ctx: Ctx
  white: Player
  black: Player
}) => {
  const columnCount = 8
  const rowCount = 3

  const itemSx: UI.Sx = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "inherit",
  }

  return (
    <UI.Box sx={{ width: "100%", position: "relative", color: "#fff" }}>
      <svg
        width="100%"
        height="100%"
        viewBox={[0, 0, columnCount, rowCount].join(" ")}
      >
        {[...Array(columnCount)].map((_, x) =>
          [...Array(rowCount)].map((_, y) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={
                toChecker({ x, y }) === "Light"
                  ? theme.lightSquare
                  : theme.darkSquare
              }
            />
          )),
        )}
      </svg>

      <UI.Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "inherit",
          background: "rgba(0, 0, 0, 0.4)",
        }}
      >
        <UI.Box sx={{ ...itemSx }}>
          <PlayerSlot ctx={ctx} player={white} />
        </UI.Box>
        <UI.Box sx={{ ...itemSx }}>
          <PawnIcon sx={{ color: "#fff", width: 72, height: 72 }} />
        </UI.Box>
        <UI.Typography sx={{ color: "#fff", fontSize: 32 }}>vs</UI.Typography>
        <UI.Box sx={{ ...itemSx }}>
          <PawnIcon
            sx={{ stroke: "#fff", color: "#101010", width: 72, height: 72 }}
          />
        </UI.Box>
        <UI.Box sx={{ ...itemSx }}>
          <PlayerSlot ctx={ctx} player={black} />
        </UI.Box>
      </UI.Box>
    </UI.Box>
  )
}

const PlayerSlot = ({ player, ctx }: { player: Player; ctx: Ctx }) => {
  const iconSx = { width: 48, height: 48 }
  const boxSx: UI.Sx = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "inherit",
  }
  // const textSx: UI.Sx = { color: "#101010" }
  switch (player.type) {
    case "Bot": {
      return (
        <UI.Box sx={{ ...boxSx }}>
          <UI.Icons.SmartToy sx={{ color: "inherit", ...iconSx }} />
          {/* <UI.Typography variant="caption" sx={{ ...textSx }}>
            {player.label}
          </UI.Typography> */}
        </UI.Box>
      )
    }

    case "none": {
      return (
        <UI.Box sx={{ ...boxSx }}>
          <UI.Avatar sx={{ ...iconSx }}>
            <UI.Icons.QuestionMark />
          </UI.Avatar>
          {/* <UI.Typography variant="caption" sx={{ ...textSx }}>
            ?
          </UI.Typography> */}
        </UI.Box>
      )
    }

    case "User": {
      return (
        <UI.Box sx={{ ...boxSx }}>
          <UI.Avatar
            src={ctx.profiles[player.userId]?.avatarUrl ?? ""}
            sx={{ ...iconSx }}
          ></UI.Avatar>
          {/* <UI.Typography variant="caption" noWrap sx={{ ...textSx }}>
            {store.Profile[player.userId]?.username ?? "..."}
          </UI.Typography> */}
        </UI.Box>
      )
    }
  }
}

export const PawnIcon = ({ sx, stroke }: { sx: UI.Sx; stroke?: string }) => {
  return (
    <UI.SvgIcon viewBox="0 0 45 45" sx={{ ...sx }}>
      <g
        transform="translate(0 -2) scale(1)"
        style={{ transformOrigin: "center" }}
      >
        <path
          fill={"currentColor"}
          stroke={stroke ?? "#000"}
          strokeLinecap="round"
          strokeWidth="1.5"
          d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        ></path>
      </g>
    </UI.SvgIcon>
  )
}
