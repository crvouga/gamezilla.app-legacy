import { UserId } from "../Data/UserId"
import * as UI from "../UI"
import * as ProfileStore from "../Profile/Profile.Store"

//
//
//
// Model
//
//
//

export type Ctx = {
  profiles: ProfileStore.Model["profiles"]
  currentUserId: UserId
}

//
//
//
// View
//
//
//

export const bannerArtAspectRatio = Math.pow(3 / 4, 4)

export const GameModeCard = ({
  leftIcon,
  rightIcon,
  title,
  onClick,
}: {
  leftIcon: UI.ViewNode
  rightIcon: UI.ViewNode
  title: string
  onClick: () => void
}) => {
  const theme = UI.useTheme()
  return (
    <UI.CardActionArea onClick={onClick}>
      <UI.AspectRatio aspectRatio={1}>
        <UI.Card
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <UI.Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginBottom: 1,
            }}
          >
            {leftIcon}
            {rightIcon}
          </UI.Box>
          <UI.Typography variant="h5">{title}</UI.Typography>
        </UI.Card>
      </UI.AspectRatio>
    </UI.CardActionArea>
  )
}

const iconSize = 64
const iconSx: UI.Sx = { width: iconSize, height: iconSize }

export const GameModeCardGrid = ({
  onUserVsUser,
  onUserVsBot,
}: {
  onUserVsUser: () => void
  onUserVsBot: () => void
}) => {
  return (
    <UI.Box sx={{ display: "flex", gap: 2, padding: 2, flex: 1 }}>
      <UI.Box sx={{ width: "50%" }}>
        <GameModeCard
          leftIcon={<UI.Icons.Person sx={iconSx} />}
          rightIcon={<UI.Icons.Person sx={iconSx} />}
          title="Vs Player"
          onClick={onUserVsUser}
        />
      </UI.Box>
      <UI.Box sx={{ width: "50%" }}>
        <GameModeCard
          leftIcon={<UI.Icons.Person sx={iconSx} />}
          rightIcon={<UI.Icons.SmartToy sx={iconSx} />}
          title="Vs Bot"
          onClick={onUserVsBot}
        />
      </UI.Box>
    </UI.Box>
  )
}

type Player =
  | {
      type: "User"
      userId: UserId
    }
  | {
      type: "Bot"
      label: string
    }
  | {
      type: "None"
    }

const avatarSx: UI.Sx = {
  width: 32,
  height: 32,
}

export const VersusHeader = ({
  left,
  renderLeftIcon,
  right,
  renderRightIcon,
  background,
  ctx,
  sx,
}: {
  ctx: Ctx
  background: UI.ViewNode
  renderLeftIcon: (sx: UI.Sx) => UI.ViewNode
  left: Player
  renderRightIcon: (sx: UI.Sx) => UI.ViewNode
  right: Player
  sx?: UI.Sx
}) => {
  const iconSx: UI.Sx = {
    width: 52,
    height: 52,
    display: "block",
  }
  return (
    <UI.Box
      sx={{
        position: "relative",
        width: "100%",
        paddingY: 10,
        overflowX: "hidden",
        ...sx,
      }}
    >
      <UI.Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {background}
      </UI.Box>

      <UI.Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          //
          overflow: "hidden",
          //
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingX: 2,
        }}
      >
        <UI.Box
          sx={{
            display: "flex",
            gap: 1,
            flex: 1,
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          <VersusHeaderPlayer
            player={left}
            ctx={ctx}
          />
          {renderLeftIcon({ ...iconSx })}
        </UI.Box>
        <UI.Typography
          align="center"
          color="#fff"
          sx={{ fontSize: 24, marginX: 2 }}
        >
          vs
        </UI.Typography>
        <UI.Box
          sx={{
            display: "flex",
            gap: 1,
            flex: 1,
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          {renderRightIcon({ ...iconSx })}
          <VersusHeaderPlayer
            player={right}
            ctx={ctx}
          />
        </UI.Box>
      </UI.Box>
    </UI.Box>
  )
}

const VersusHeaderPlayer = ({ player, ctx }: { player: Player; ctx: Ctx }) => {
  const sx: UI.Sx = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    overflow: "hidden",
    width: "100%",
    maxWidth: 72,
  }
  switch (player.type) {
    case "Bot": {
      return (
        <UI.Box sx={{ ...sx }}>
          <UI.Icons.SmartToy
            sx={{ marginX: "auto", width: 32, height: 32, color: "#fff" }}
          />
          <UI.Typography
            color="#fff"
            noWrap
            align="center"
          >
            {player.label}
          </UI.Typography>
        </UI.Box>
      )
    }
    case "None": {
      return (
        <UI.Box sx={{ ...sx }}>
          <UI.Avatar sx={{ ...avatarSx, marginX: "auto" }}>
            <UI.Icons.QuestionMark />
          </UI.Avatar>
          <UI.Typography
            noWrap
            color="#fff"
            align="center"
          >
            ?
          </UI.Typography>
        </UI.Box>
      )
    }

    case "User": {
      const profile = ctx.profiles[player.userId]
      return (
        <UI.Box sx={{ ...sx }}>
          <UI.Avatar
            sx={{ ...avatarSx, marginX: "auto" }}
            src={profile?.avatarUrl}
          />
          <UI.Typography
            noWrap
            color="#fff"
            align="center"
          >
            {profile?.username ?? "..."}
          </UI.Typography>
        </UI.Box>
      )
    }
  }
}

type GameHeaderProps = {
  onHome: () => void
  onRoom: () => void
  title: string
  roomCount: number
}

export const GameHeader = ({
  onHome,
  title,
  onRoom,
  roomCount,
}: GameHeaderProps) => {
  return (
    <UI.Header
      left={
        <UI.IconButton
          onClick={onHome}
          sx={{ ml: -1 }}
        >
          <UI.Icons.Home />
        </UI.IconButton>
      }
      title={title}
      right={
        <UI.IconButton onClick={onRoom}>
          <UI.Badge title={String(roomCount)}>
            <UI.Icons.People />
          </UI.Badge>
        </UI.IconButton>
      }
    />
  )
}
