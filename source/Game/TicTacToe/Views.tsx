import { UserId } from "../../Data"
import * as ProfileStore from "../../Profile/Profile.Store"
import * as UI from "../../UI"
import { bannerArtAspectRatio } from "../Game.Shared"
import { gameTheme, PlayerTypeIcon } from "./TicTacToe"

export const BannerArt = ({ title }: { title: string }) => {
  return (
    <UI.AspectRatio aspectRatio={bannerArtAspectRatio}>
      <UI.Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: gameTheme.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          paddingY: 2,
          paddingX: 2
        }}
      >

        <PlayerTypeIcon playerType="X" sx={{ color: gameTheme.cross, width: 120, height: 120 }} />
        <PlayerTypeIcon playerType="O" sx={{ color: gameTheme.naught, width: 120, height: 120 }} />
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
          background: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.2))`,
          color: "#fff",
        }}
      >
        <UI.Box sx={{ flex: 1 }} />

        <UI.Typography
          sx={{ paddingX: 2, paddingBottom: 1 }}
          variant="h3"
          color="inherit"
        >
          {title}
        </UI.Typography>
      </UI.Box>
    </UI.AspectRatio>

  )
}

type Player =
  | { type: "User", userId?: UserId }
  | { type: "Bot", label: string }

export const VersusHeader = ({ X, O, store }: { X: Player, O: Player, store: ProfileStore.Model }) => {
  const largeIconSx = { width: 72, height: 72 }

  return (
    <UI.Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        backgroundColor: gameTheme.background,
        paddingY: 4,
        paddingX: 2
      }}
    >


      <ViewHeaderPlayerSlot
        player={X}
        store={store}
      />



      <UI.Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PlayerTypeIcon playerType={"X"} sx={{ ...largeIconSx, marginLeft: 2, color: gameTheme.cross }} />

        <UI.Typography
          align="center"
          sx={{ fontSize: 24, color: "inherit", paddingX: 2, flex: 1 }}
        >
          vs
        </UI.Typography>

        <PlayerTypeIcon playerType={"O"} sx={{ ...largeIconSx, marginRight: 2, color: gameTheme.naught }} />
      </UI.Box>

      <ViewHeaderPlayerSlot
        player={O}
        store={store}
      />

    </UI.Box >

  )
}


const ViewHeaderPlayerSlot = ({
  store,
  player,
}: {
  player: Player
  store: ProfileStore.Model
}) => {
  const iconSx = { width: 42, height: 42 }
  const wrapperSx: UI.Sx = { display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", overflow: "hidden", flexWrap: "none", textOverflow: "ellipsis", width: '100%' }

  if (player.type === 'Bot') {
    return (
      <UI.Box sx={wrapperSx}>
        <UI.Icons.SmartToy sx={{ ...iconSx }} />
        <UI.Typography
          variant="caption"
          color="inherit"
          noWrap
        >
          {player.label}
        </UI.Typography>
      </UI.Box>
    )
  }

  if (!player.userId) {
    return (
      <UI.Box sx={wrapperSx}>
        <UI.Avatar sx={{ ...iconSx }}>
          <UI.Icons.QuestionMark />
        </UI.Avatar>
        <UI.Typography variant="caption" color="inherit">
          ?
        </UI.Typography>
      </UI.Box>
    )
  }

  return (
    <UI.Box sx={wrapperSx}>
      <UI.Avatar src={store.profiles[player.userId]?.avatarUrl} sx={{ ...iconSx }}>
        <UI.Icons.QuestionMark />
      </UI.Avatar>
      <UI.Typography
        variant="caption"
        color="inherit"
        noWrap
        align="center"
        sx={{ width: "100%", textOverflow: "ellipsis" }}
      >
        {store.profiles[player.userId]?.username ?? "..."}
      </UI.Typography>
    </UI.Box>
  )
}
