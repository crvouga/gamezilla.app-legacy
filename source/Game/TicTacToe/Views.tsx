import * as UI from "../../UI"
import { theme, ViewSlot } from "./TicTacToe"

export const BannerArt = ({ title }: { title: string }) => {
  const strokeWidth = 0.25
  return (
    <UI.AspectRatio aspectRatio={Math.pow(3 / 4, 4)}>
      <UI.Box
        sx={{
          width: "100%",
          height: "100%",
          padding: 2,
          backgroundColor: theme.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <svg
          width="33%"
          viewBox="-1 -1 2 2"
        >
          <ViewSlot
            strokeWidth={strokeWidth}
            slot="X"
            cx={0}
            cy={0}
            r={0.75}
          />
        </svg>
        <svg
          width="33%"
          viewBox="-1 -1 2 2"
        >
          <ViewSlot
            strokeWidth={strokeWidth}
            slot="O"
            cx={0}
            cy={0}
            r={0.75}
          />
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
          background: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4))`,
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