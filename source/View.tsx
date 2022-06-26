import * as MuiIcons from "@mui/icons-material"
import * as MuiLab from "@mui/lab"
import * as Mui from "@mui/material"
import { blue } from "@mui/material/colors"
import { Html, Platform } from "Core"
import { useMemo } from "react"

//
//
//
// View
//
//
//

type Dom = React.ReactElement<unknown>

export type View<Msg> = (dispatch: Platform.Dispatch<Msg>) => Dom

export const map = <A, Msg>(
  f: (a: A) => Msg,
): ((ha: Html.Html<Dom, A>) => Html.Html<Dom, Msg>) => {
  return Html.map(f)
}

//
//
//
// Theme
//
//
//

const createTheme = ({ mode }: { mode: "light" | "dark" }) =>
  Mui.responsiveFontSizes(
    Mui.createTheme({
      palette: {
        mode: mode,
        primary: blue,
      },
      typography: {
        fontFamily: ["Nunito"].join(","),
        fontWeightRegular: "bold",
        fontWeightMedium: "bold",
        fontWeightLight: "bold",
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "capitalize",
              fontWeight: 800,
              borderRadius: "120px",
            },
          },
        },
      },
    }),
  )

const darkTheme = createTheme({ mode: "dark" })
const lightTheme = createTheme({ mode: "light" })

export const ThemeProvider = ({
  children,
  themeMode,
}: {
  children: React.ReactNode
  themeMode: ThemeMode
}) => {
  const prefersDarkMode = Mui.useMediaQuery("(prefers-color-scheme: dark)")

  const theme = useMemo(() => {
    switch (themeMode) {
      case "Dark":
        return darkTheme

      case "Light":
        return lightTheme
      case "System":
        if (prefersDarkMode) {
          return darkTheme
        }
        return lightTheme
    }
  }, [themeMode, prefersDarkMode])

  return (
    <Mui.ThemeProvider theme={theme}>
      <Mui.CssBaseline />
      {children}
    </Mui.ThemeProvider>
  )
}

export const useTheme = Mui.useTheme

export type ThemeMode = "Light" | "Dark" | "System"

export const ThemeModeIcon = ({ themeMode }: { themeMode: ThemeMode }) => {
  switch (themeMode) {
    case "Dark":
      return <Icons.DarkMode />

    case "Light":
      return <Icons.LightMode />

    case "System":
      return <Icons.SettingsBrightness />
  }
}

const themeModes: { [key in ThemeMode]: ThemeMode } = {
  Light: "Light",
  Dark: "Dark",
  System: "System",
}

const isThemeMode = (themeMode: unknown): themeMode is ThemeMode => {
  return typeof themeMode === "string" && themeMode in themeModes
}

export const ThemeModeToggleButtons = ({
  themeMode,
  onChange,
}: {
  themeMode: ThemeMode
  onChange: (themeMode: ThemeMode) => void
}) => {
  return (
    <Mui.ToggleButtonGroup
      fullWidth
      value={themeMode}
      exclusive
      orientation="vertical"
      onChange={(event, value) => {
        if (isThemeMode(value)) {
          onChange(value)
        }
      }}
    >
      {Object.values(themeModes).map((themeMode) => (
        <Mui.ToggleButton key={themeMode} value={themeMode}>
          <Mui.Box
            sx={{
              marginRight: 1,
              alignItems: "center",
              display: "flex",
            }}
          >
            <ThemeModeIcon themeMode={themeMode} />
          </Mui.Box>
          {themeMode}
        </Mui.ToggleButton>
      ))}
    </Mui.ToggleButtonGroup>
  )
}

//
//
//
// Components
//
//
//

export const Icons = MuiIcons

export const TextField = Mui.TextField

export const InputBase = Mui.InputBase

export const Snackbar = Mui.Snackbar

export const Box = Mui.Box

export const Divider = Mui.Divider

export const ListItemButton = Mui.ListItemButton

export const LinearProgress = Mui.LinearProgress

export const Chip = Mui.Chip

export const ListItemText = Mui.ListItemText

export const ListItemIcon = Mui.ListItemIcon

export const Checkbox = Mui.Checkbox

export const ListItemSecondaryAction = Mui.ListItemSecondaryAction

export const Paper = Mui.Paper

export const Button = MuiLab.LoadingButton

export const Typography = Mui.Typography

export const Dialog = Mui.Dialog

export const DialogTitle = Mui.DialogTitle

export const DialogActions = Mui.DialogActions

export const Alert = Mui.Alert

export const CircularProgress = Mui.CircularProgress

export const ListItemAvatar = Mui.ListItemAvatar

export const Avatar = Mui.Avatar

export const MenuItem = Mui.MenuItem

export const Autocomplete = Mui.Autocomplete

export const Select = Mui.Select

export const List = Mui.List

export const ButtonBase = Mui.ButtonBase

export const Toolbar = Mui.Toolbar

export const IconButton = Mui.IconButton

export const Field = ({
  label,
  value,
  onClick,
}: {
  label: string
  value: string
  onClick: () => void
}) => (
  <ListItemButton onClick={onClick}>
    <ListItemText
      primaryTypographyProps={{
        variant: "subtitle1",
        color: "text.secondary",
      }}
      primary={label}
      secondaryTypographyProps={{ variant: "h6", color: "text.primary" }}
      secondary={value}
    />
    <ListItemSecondaryAction>
      <Icons.ChevronRight />
    </ListItemSecondaryAction>
  </ListItemButton>
)

export const Header = ({
  left,
  title,
  right,
}: {
  left?: React.ReactNode
  title: React.ReactNode
  right?: React.ReactNode
}) => {
  return (
    <Mui.Toolbar>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {left}
      </Box>

      <Typography sx={{ flex: 2 }} align="center" variant="h6">
        {title}
      </Typography>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {right}
      </Box>
    </Mui.Toolbar>
  )
}

export const HeaderBackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Mui.IconButton edge="start" onClick={onClick}>
      <Icons.ChevronLeft />
    </Mui.IconButton>
  )
}

export const Page = ({ children, sx }: Mui.BoxProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        maxWidth: "100%",
        userSelect: "none",
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

export const LoadingPage = () => {
  return (
    <Page sx={{ justifyContent: "center", alignItems: "center" }}>
      <CircularProgress />
    </Page>
  )
}

export const LoadingBackdrop = ({ open }: { open?: boolean }) => {
  return (
    <Mui.Backdrop sx={{ zIndex: 10 }} open={Boolean(open)}>
      <CircularProgress />
    </Mui.Backdrop>
  )
}

export const LoadingDialog = ({
  open,
  title,
}: {
  open: boolean
  title: string
}) => {
  return (
    <Dialog open={open}>
      <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <CircularProgress sx={{ marginRight: 2 }} />
        <Typography variant="h6">{title}</Typography>
      </Box>
    </Dialog>
  )
}

export const ConformationDialog = ({
  open,
  onCancel,
  onClose,
  onConfirm,
  title,
  confirmTitle,
  cancelTitle = "Cancel",
}: {
  open: boolean
  onCancel: () => void
  onClose: () => void
  onConfirm: () => void
  title: string
  confirmTitle: string
  cancelTitle?: string
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>{cancelTitle}</Button>
        <Button onClick={onConfirm}>{confirmTitle}</Button>
      </DialogActions>
    </Dialog>
  )
}
