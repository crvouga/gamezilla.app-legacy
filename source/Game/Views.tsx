import * as UI from "../UI"

export const BotIcon = UI.Icons.SmartToy

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
