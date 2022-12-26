import { UserId } from "../Data/UserId"
import * as ProfileStore from "../Profile/Profile.Store"
import { avatar, Avatar, box, Box, Button, fillBox, FillBox, icon, Icons, paper, Sx, text, ToggleButton, ToggleButtonGroup, Typography, ViewNode } from "../UI"
import * as Chess from "./Chess/Chess"
import * as ConnectFour from "./ConnectFour/ConnectFour"
import {
  GameName
} from "./Game.Types"
import * as Gomoku from "./Gomoku/Gomoku/Gomoku"
import * as Maze from "./Maze/Maze"
import * as Snake from "./Snake/Snake"
import * as Tetris from "./Tetris/Tetris.Frontend"
import * as TicTacToe from "./TicTacToe/TicTacToe/TicTacToe"

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


export const viewUserVsBotSetupScreen = <BotLevel, Player>({
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
    <FillBox sx={{ overflowY: "scroll", py: 2, }}>
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

export const viewUserVsBotGameScreen = <Player,>({
  botPlayer,
  userPlayer,
  botLabel,
  viewPlayerIcon,
  playerUserId,
  ctx,
  viewGame,
  leftPlayer
}: {
  botPlayer: Player,
  botLabel: string,
  userPlayer: Player,
  leftPlayer: Player,
  playerUserId: UserId,
  ctx: Ctx
  viewPlayerIcon: (player: Player, sx: Sx) => ViewNode
  viewGame: () => ViewNode
}) => {
  const iconSize = {
    width: 32,
    height: 32
  }

  const botSlot =
    paper({ display: "flex", variant: "outlined", alignItems: "center", p: 1, flex: 1, overflow: 'hidden' }, [
      viewPlayerIcon(botPlayer, { ...iconSize, mr: 1 }),
      icon("smart-toy", { ...iconSize, mr: 1, }),
      text({}, [botLabel])
    ])

  const userSlot =
    paper({ display: "flex", variant: "outlined", alignItems: "center", p: 1, flex: 1, overflow: 'hidden' }, [
      viewPlayerIcon(userPlayer, { ...iconSize, mr: 1 }),
      avatar({ ...iconSize, mr: 1, src: ctx.profiles[playerUserId]?.avatarUrl }),
      text({ noWrap: true }, [ctx.profiles[playerUserId]?.username])
    ])

  const leftSlot = userPlayer === leftPlayer ? userSlot : botSlot

  const rightSlot = userPlayer !== leftPlayer ? userSlot : botSlot

  return (
    fillBox({}, [
      box({ px: 2, pt: 2, display: "flex", gap: 2, justifyContent: "center", alignItems: 'center' }, [leftSlot, rightSlot]),
      viewGame()
    ])
  )
}



export const viewSelectModeScreen = ({
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


export const viewCoverArt = ({ gameName }: { gameName: GameName }) => {
  switch (gameName) {
    case "Chess": {
      return Chess.viewCoverArt()
    }
    case "ConnectFour": {
      return ConnectFour.viewCoverArt()
    }
    case "Snake": {
      return Snake.viewCoverArt()
    }
    case "TicTacToe": {
      return TicTacToe.viewCoverArt()
    }
    case "Tetris": {
      return Tetris.viewCoverArt()
    }
    case "Maze": {
      return Maze.viewCoverArt()
    }
    case 'Gomoku': {
      return Gomoku.viewCoverArt()
    }
  }
}