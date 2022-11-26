import { UserId } from "../Data/UserId"
import * as ProfileStore from "../Profile/Profile.Store"
import { Sx, Avatar, Icons, useTheme, Box, Typography, AspectRatio, CardActionArea, Card, ViewNode } from "../UI"

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
  leftIcon: ViewNode
  rightIcon: ViewNode
  title: string
  onClick: () => void
}) => {
  const theme = useTheme()
  return (
    <CardActionArea onClick={onClick}>
      <AspectRatio aspectRatio={1}>
        <Card
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginBottom: 1,
            }}
          >
            {leftIcon}
            {rightIcon}
          </Box>
          <Typography variant="h5">{title}</Typography>
        </Card>
      </AspectRatio>
    </CardActionArea>
  )
}

const iconSize = 64
const iconSx: Sx = { width: iconSize, height: iconSize }

export const GameModeCardGrid = ({
  onUserVsUser,
  onUserVsBot,
}: {
  onUserVsUser: () => void
  onUserVsBot: () => void
}) => {
  return (
    <Box sx={{ display: "flex", gap: 2, padding: 2, flex: 1 }}>
      <Box sx={{ width: "50%" }}>
        <GameModeCard
          leftIcon={<Icons.Person sx={iconSx} />}
          rightIcon={<Icons.Person sx={iconSx} />}
          title="Vs Player"
          onClick={onUserVsUser}
        />
      </Box>
      <Box sx={{ width: "50%" }}>
        <GameModeCard
          leftIcon={<Icons.Person sx={iconSx} />}
          rightIcon={<Icons.SmartToy sx={iconSx} />}
          title="Vs Bot"
          onClick={onUserVsBot}
        />
      </Box>
    </Box>
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

const avatarSx: Sx = {
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
  background: ViewNode
  renderLeftIcon: (sx: Sx) => ViewNode
  left: Player
  renderRightIcon: (sx: Sx) => ViewNode
  right: Player
  sx?: Sx
}) => {
  const iconSx: Sx = {
    width: 52,
    height: 52,
    display: "block",
  }
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        paddingY: 10,
        overflowX: "hidden",
        ...sx,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {background}
      </Box>

      <Box
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
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flex: 1,
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          <VersusHeaderPlayer player={left} ctx={ctx} />
          {renderLeftIcon({ ...iconSx })}
        </Box>
        <Typography
          align="center"
          color="#fff"
          sx={{ fontSize: 24, marginX: 2 }}
        >
          vs
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flex: 1,
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          {renderRightIcon({ ...iconSx })}
          <VersusHeaderPlayer player={right} ctx={ctx} />
        </Box>
      </Box>
    </Box>
  )
}

const VersusHeaderPlayer = ({ player, ctx }: { player: Player; ctx: Ctx }) => {
  const sx: Sx = {
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
        <Box sx={{ ...sx }}>
          <Icons.SmartToy
            sx={{ marginX: "auto", width: 32, height: 32, color: "#fff" }}
          />
          <Typography color="#fff" noWrap align="center">
            {player.label}
          </Typography>
        </Box>
      )
    }
    case "None": {
      return (
        <Box sx={{ ...sx }}>
          <Avatar sx={{ ...avatarSx, marginX: "auto" }}>
            <Icons.QuestionMark />
          </Avatar>
          <Typography noWrap color="#fff" align="center">
            ?
          </Typography>
        </Box>
      )
    }

    case "User": {
      const profile = ctx.profiles[player.userId]
      return (
        <Box sx={{ ...sx }}>
          <Avatar
            sx={{ ...avatarSx, marginX: "auto" }}
            src={profile?.avatarUrl}
          />
          <Typography noWrap color="#fff" align="center">
            {profile?.username ?? "..."}
          </Typography>
        </Box>
      )
    }
  }
}

export const PlayerGameSlot = ({
  playerIcon,
  userId,
  ctx,
}: {
  playerIcon: ViewNode,
  userId: UserId
  ctx: Ctx
}) => {
  const size = { width: 32, height: 32 }
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flex: 1,
        overflow: "hidden",
      }}
    >
      <Box sx={{ ...size }}>
        {playerIcon}
      </Box>
      <Avatar
        src={ctx.profiles[userId]?.avatarUrl}
        sx={{ ...size, mr: 1 }}
      />
      <Typography noWrap>
        {ctx.profiles[userId]?.username ?? "..."}
      </Typography>
    </Box>
  )
}