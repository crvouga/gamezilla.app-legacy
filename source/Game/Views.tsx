import { UserId } from "../Data/UserId"
import * as UI from "../UI"
import * as Store from "../Store"

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

export const GameModeCardGrid = ({ onUserVsUser, onUserVsBot }: { onUserVsUser: () => void, onUserVsBot: () => void }) => {
  return (
    <UI.Box sx={{ display: "flex", gap: 2, padding: 2, flex: 1 }}>
      <UI.Box sx={{ width: "50%" }}>
        <GameModeCard
          leftIcon={<UI.Icons.Person sx={iconSx} />}
          rightIcon={<UI.Icons.Person sx={iconSx} />}
          title="Vs User"
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
    type: 'User',
    userId: UserId,
    icon: UI.ViewNode
  }
  | {
    type: "Bot",
    label: string,
    icon: UI.ViewNode
  }
  | {
    type: "None"
    icon: UI.ViewNode
  }

const avatarSx: UI.Sx = {
  width: 32,
  height: 32,
}


export const VersusHeader = ({ left, right, background, store, }: { background: UI.ViewNode, left: Player, right: Player, store: Store.Model }) => {
  // const iconSx: UI.Sx = {
  //   width: 52,
  //   height: 52,
  // }
  return (
    <UI.Box
      sx={{
        paddingY: 6,
        paddingX: 2,
        display: 'flex',
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: "center",
        gap: 2,
        position: "relative",
      }}
    >
      <UI.Box sx={{ position: "absolute", top: 0, left: 0, width: '100%', height: '100%' }}>
        {background}
      </UI.Box>
      <VersusHeaderPlayer player={left} store={store} />
      {left.icon}
      <UI.Typography color="#fff" sx={{ fontSize: 32 }}>
        vs
      </UI.Typography>
      {right.icon}
      <VersusHeaderPlayer player={right} store={store} />
    </UI.Box>
  )
}

export const VersusHeaderPlayer = ({ player, store }: { player: Player, store: Store.Model }) => {
  switch (player.type) {
    case 'Bot': {
      return (
        <>
          <UI.Icons.SmartToy />
          <UI.Typography align="center">
            {player.label}
          </UI.Typography>
        </>
      )
    }
    case 'None': {
      return (
        <>
          <UI.Avatar sx={{ ...avatarSx, marginX: "auto" }}>
            <UI.Icons.QuestionMark />
          </UI.Avatar>
          <UI.Typography color="#fff" align='center'>
            ?
          </UI.Typography>
        </>
      )
    }

    case 'User': {
      const profile = store.Profile[player.userId]
      return (
        <>
          <UI.Avatar sx={{ ...avatarSx, marginX: "auto" }} src={profile?.avatarUrl} />
          <UI.Typography color="#fff" align='center'>
            {profile?.username ?? "..."}
          </UI.Typography>
        </>
      )
    }
  }
}