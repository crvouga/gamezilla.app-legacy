import { UserId } from "./Data"
import * as ProfileStore from "./Profile/Profile.Store"
import { CircularProgress, Box, Button, ViewNode, Sx, FillBox, Typography } from "./UI"

export type Ctx = {
  profiles: ProfileStore.Model["profiles"]
  currentUserId: UserId
}


export const ViewEmptyState = ({
  renderIcon,
  title,
  actionIcon,
  actionTitle,
  onAction
}: {
  actionIcon: ViewNode
  actionTitle: string,
  onAction: () => void,
  title: string,
  renderIcon: (props: { sx: Sx }) => ViewNode
}) => {
  return (
    <FillBox sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "text.secondary" }}>
      {renderIcon({ sx: { width: 100, height: 100 } })}
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Button startIcon={actionIcon} variant="contained" onClick={onAction}>
        {actionTitle}
      </Button>
    </FillBox>
  )
}

export const ViewLoadingState = ({ title }: { title: string }) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}
    >
      <CircularProgress sx={{ mb: 1 }} />
      <Typography color="text.secondary">
        {title}
      </Typography>
    </Box>
  )
}