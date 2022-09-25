import * as UI from "../../UI"
import * as Board from "./Board"

export const ViewActionButton = ({
  title,
  icon,
  onClick,
}: {
  title: string
  icon: UI.ViewNode
  onClick: () => void
}) => {
  const theme = UI.useTheme()
  return (
    <UI.ButtonBase
      onClick={onClick}
      sx={{
        flex: 1,
        height: 52,
        display: "flex",
        flexDirection: "column",
        color: theme.palette.action.active,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {icon}
      <UI.Typography variant="caption">{title}</UI.Typography>
    </UI.ButtonBase>
  )
}


export const ViewHeader = ({ title }: { title: string }) => {
  return (
    <UI.AspectRatio aspectRatio={Math.pow(3 / 4, 3)}>
      <UI.Box sx={{ width: "100%", position: "relative" }}>
        <Board.View key={"exampleModel"} boardOrientation="b" model={Board.exampleModel} />
      </UI.Box>

      <UI.Box sx={{
        zIndex: 10000,
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: 'flex',
        flexDirection: "column",
        background: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6))`,
      }}>
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