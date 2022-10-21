import * as UI from "../UI"

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