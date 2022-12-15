import { UserId } from "../Data/UserId"
import * as ProfileStore from "../Profile/Profile.Store"
import { AspectRatio, Avatar, Box, Button, Card, CardActionArea, FillBox, Icons, Sx, ToggleButton, ToggleButtonGroup, Typography, useTheme, ViewNode } from "../UI"

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

export type GameRoomCtx = {
  onQuit: () => void
  hostId: UserId
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
  ctx,
  sx,
}: {
  ctx: Ctx
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingY: 10,
        overflowX: "hidden",
        ...sx,
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


export const UserVsBotSetupPage = <BotLevel, Player>({
  title,
  subtitle,
  coverArt,
  ctx,
  playerId,
  botLevel,
  player,
  onStartGame,
  onCancel,
  onStopPlaying,
  onStartPlaying
}: {
  ctx: Ctx
  title: string,
  subtitle: string,
  coverArt: ViewNode,
  playerId: UserId | null
  botLevel: {
    values: BotLevel[]
    selected: BotLevel
    onInput: (value: BotLevel) => void
  }
  player: {
    selected: Player,
    values: Player[]
    onInput: (value: Player) => void
    icon: (value: Player) => ViewNode
  }
  onCancel: () => void,
  onStartGame: () => void,
  onStartPlaying: () => void
  onStopPlaying: () => void
}) => {

  return (
    <FillBox sx={{ overflowY: "scroll", pt: 2, }}>
      <Box sx={{ height: 100, width: 100, minHeight: 100, minWidth: 100, mx: 'auto', borderRadius: 2, overflow: "hidden", mt: 2, mb: 2 }}>
        {coverArt}
      </Box>

      <Typography variant="h2" align="center" sx={{ mb: 1 }} >
        {title}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary" align="center" sx={{ mb: 2 }}>
        {subtitle}
      </Typography>

      <Typography color="text.secondary" sx={{ px: 2, mb: 1 }}>
        Human
      </Typography>

      {playerId ? (

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            mb: 3,
          }}>
          <Avatar sx={{ mr: 1 }} src={playerId ? ctx.profiles[playerId]?.avatarUrl : ""} />
          <Typography noWrap sx={{ flex: 1 }}>
            {playerId ? ctx.profiles[playerId]?.username ?? "..." : "..."}
          </Typography>
          {ctx.currentUserId === playerId &&
            <Button onClick={onStopPlaying}>
              Stop Playing
            </Button>}
        </Box>
      ) : (

        <Box
          sx={{
            px: 2,
            mb: 3,
          }}>
          <Button fullWidth variant="contained" onClick={onStartPlaying}>
            Start Playing
          </Button>
        </Box>
      )}

      <Typography color="text.secondary" sx={{ px: 2, mb: 1 }}>
        Computer
      </Typography>

      <Box
        sx={{
          width: "100%",
          px: 2,
          mb: 3,
        }}>

        <ToggleButtonGroup disabled={ctx.currentUserId !== playerId} fullWidth value={String(botLevel.selected)}>
          {botLevel.values.map((value) => (
            <ToggleButton
              key={String(value)}
              value={String(value)}
              onClick={() => botLevel.onInput(value)}>
              {String(value)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Typography color="text.secondary" sx={{ px: 2, mb: 1 }}>
        Play As
      </Typography>

      <Box
        sx={{
          width: "100%",
          px: 2,
          mb: 3,
        }}>

        <ToggleButtonGroup disabled={ctx.currentUserId !== playerId} fullWidth value={String(player.selected)}>
          {player.values.map((value) => (
            <ToggleButton key={String(value)} value={String(value)} onClick={() => player.onInput(value)}>
              {player.icon(value)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ px: 2, mt: 2 }} >
        <Button
          disabled={ctx.currentUserId !== playerId}
          fullWidth
          variant="contained"
          endIcon={<Icons.ArrowRight />}
          onClick={onStartGame}
        >
          Start Game
        </Button>
      </Box>

      <Box sx={{ flex: 1, py: 2, }} />

      <Box sx={{ px: 2, mt: 2 }} >
        <Button fullWidth variant="outlined"
          startIcon={<Icons.ArrowLeft />}
          onClick={onCancel}
        >
          Back
        </Button>
      </Box>

    </FillBox>
  )
}

export const GameModeSelectPage = ({
  ctx,
  title,
  coverArt,
  onUserVsComputer,
  onUserVsUser,
  gameRoomCtx,
}: {
  gameRoomCtx: GameRoomCtx,
  ctx: Ctx
  title: string,
  coverArt: ViewNode,
  onUserVsUser: () => void
  onUserVsComputer: () => void
}) => {

  if (ctx.currentUserId !== gameRoomCtx.hostId) {

    return (
      <FillBox sx={{ display: 'flex', alignItems: "center", justifyContent: 'center' }}>

        <Box sx={{ height: 100, width: 100, mx: 'auto', borderRadius: 2, overflow: "hidden", mb: 1 }}>
          {coverArt}
        </Box>

        <Typography variant="h2" align="center" sx={{ mb: 1 }} >
          {title}
        </Typography>


        <Typography variant="subtitle2" color="text.secondary" align="center">
          Host is selecting the mode
        </Typography>
      </FillBox>
    )
  }

  return (
    <FillBox sx={{ px: 2 }}>
      <Box sx={{ height: 100, width: 100, mx: 'auto', borderRadius: 2, overflow: "hidden", mt: 4, mb: 2 }}>
        {coverArt}
      </Box>

      <Typography variant="h2" align="center" sx={{ mb: 1 }} >
        {title}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary" align="center" sx={{ mb: 2 }}>
        Select Mode
      </Typography>

      <Button onClick={onUserVsUser} size="large" fullWidth variant="outlined" startIcon={<Icons.PeopleAlt />} sx={{ mb: 2 }}>
        Play Online
      </Button>

      <Button onClick={onUserVsComputer} size="large" fullWidth variant="outlined" startIcon={<Icons.SmartToy />}>
        Play Computer
      </Button>

      <Box sx={{ flex: 1 }} />

      <Button onClick={gameRoomCtx.onQuit} size="large" fullWidth variant="outlined" startIcon={<Icons.ArrowLeft />}>
        Back
      </Button>
    </FillBox>
  )
}