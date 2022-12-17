import { ExitToApp, RestartAlt, SmartToy, SwapHorizSharp } from "@mui/icons-material"
import * as MuiLab from "@mui/lab"
import * as Mui from "@mui/material"
import { TypographyProps } from "@mui/material"
import { blue } from "@mui/material/colors"
import Slide, { SlideProps } from "@mui/material/Slide"
import { keyframes } from "@mui/system"
import { ReactNode, useEffect, useMemo, useRef } from "react"
import * as Icons from "./Icons"

const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="down" />
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
        // primary: purple,
      },
      typography: {
        fontFamily: ["Inter", "Verdana"].join(","),
      },
      components: {
        MuiCircularProgress: {
          defaultProps: {
            disableShrink: true,
          },
          styleOverrides: {
            root: {
              animationDuration: `${1 / 2.5}s`,
            },
          },
        },
        MuiSnackbar: {
          defaultProps: {
            anchorOrigin: {
              horizontal: "center",
              vertical: "top",
            },
            TransitionComponent: SlideTransition,
          },
        },
        MuiTooltip: {
          defaultProps: {
            enterTouchDelay: 0,
            enterDelay: 0,
          },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: {
              textTransform: "capitalize",
            },
          },
        },
        MuiButton: {
          defaultProps: {
            disableElevation: true,
            size: "large",
            variant: "contained",
          },
          styleOverrides: {
            root: {
              textTransform: "capitalize",
            },
          },
        },
        MuiAvatar: {
          defaultProps: {
            variant: "rounded",
          },
        },
        MuiAvatarGroup: {
          defaultProps: {
            max: 3,
            // spacing: "medium",
            variant: "rounded",
          },
        },

        MuiButtonBase: {
          styleOverrides: {
            root: {
              cursor: "pointer",
            },
          },
          defaultProps: {
            // disableTouchRipple: true,
          },
        },
      },
    }),
  )

const darkTheme = createTheme({ mode: "dark" })
const lightTheme = createTheme({ mode: "light" })

export const AppContainer = ({
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
      <Mui.CssBaseline enableColorScheme />
      <Mui.Box
        sx={{
          maxWidth: "sm",
          maxHeight: "100%",

          // userSelect: "none",
          marginX: "auto",
          position: "fixed",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          //
          display: "flex",
          flexDirection: "column",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {children}
      </Mui.Box>
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
      onChange={(_event, value) => {
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

export const TextField = ({ label, sx, ...props }: Mui.TextFieldProps) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (props.autoFocus && ref.current) {
      ref.current.focus()
    }
  }, [])

  return (
    <Box sx={{ color: "text.secondary", ...sx }}>
      <Typography
        color={props.disabled ? "text.disabled" : "inherit"}
        sx={{ mb: 1 / 2 }}
      >
        {label}
      </Typography>
      <Mui.TextField ref={ref} {...props} />
    </Box>
  )
}

export const InputBase = Mui.InputBase

export const Snackbar = Mui.Snackbar

export const Portal = Mui.Portal

export const Grow = Mui.Grow
export const Zoom = Mui.Zoom
export const Fade = Mui.Fade

export const SvgIcon = Mui.SvgIcon

export const Box = Mui.Box

export const box = ({ ...sx }: Sx, children: ViewNode[]) => {
  return (
    <Box sx={sx}>
      {children}
    </Box>
  )
}

export const Divider = Mui.Divider

export const ListItemButton = Mui.ListItemButton

export const LinearProgress = Mui.LinearProgress

export const BottomNavigation = Mui.BottomNavigation

export const BottomNavigationAction = Mui.BottomNavigationAction

export const Chip = Mui.Chip

export const ListItemText = Mui.ListItemText

export const ListItemIcon = Mui.ListItemIcon

export const Backdrop = Mui.Backdrop

export const Checkbox = Mui.Checkbox

export const ListItemSecondaryAction = Mui.ListItemSecondaryAction

export const Paper = Mui.Paper

export const paper = ({ ...sx }: Sx, children: ViewNode[]) => {
  return (
    <Paper sx={sx} variant="outlined">
      {children}
    </Paper>
  )
}

export const Button = MuiLab.LoadingButton

export const InputAdornment = Mui.InputAdornment

export const Typography = Mui.Typography

export const typography = (props: TypographyProps, children: ViewNode) => {
  return <Typography {...props}>
    {children}
  </Typography>
}

export const Tabs = Mui.Tabs

export const Tab = Mui.Tab

export const Drawer = Mui.Drawer

export const Card = Mui.Card

export const CardActionArea = Mui.CardActionArea

export const Dialog = Mui.Dialog

export const DialogTitle = Mui.DialogTitle

export const DialogActions = Mui.DialogActions

export const DialogContent = Mui.DialogContent

export const Alert = Mui.Alert

export const AlertTitle = Mui.AlertTitle

export const CircularProgress = Mui.CircularProgress

export const Collapse = Mui.Collapse

export const Badge = Mui.Badge

export const ListItemAvatar = Mui.ListItemAvatar

export const ListItem = Mui.ListItem

export const ListSubheader = Mui.ListSubheader

export const MobileStepper = Mui.MobileStepper

export const Avatar = Mui.Avatar

export const avatar = ({ src, ...sx }: { src?: string | null, } & Sx) => {
  return <Mui.Avatar src={src ?? ""} sx={sx} />
}

export const AvatarGroup = Mui.AvatarGroup

export const Menu = Mui.Menu

export const MenuItem = Mui.MenuItem

export const Autocomplete = Mui.Autocomplete

export const Select = Mui.Select

export const List = Mui.List

export const ButtonBase = Mui.ButtonBase

export const Toolbar = Mui.Toolbar

export const IconButton = Mui.IconButton

export const ToggleButtonGroup = Mui.ToggleButtonGroup

export const Tooltip = Mui.Tooltip

export const ToggleButton = Mui.ToggleButton

export const Field = ({
  label,
  value,
  onClick,
}: {
  label: string
  value: string
  onClick?: () => void
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

      <Typography noWrap sx={{ flex: 4 }} align="center" variant="h6">
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

export const fillBox = ({ ...sx }: Sx, children: ViewNode[]) => {
  return box(
    {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      overflowX: "hidden",
      overflowY: "scroll",
      padding: 0,
      margin: 0,
      ...sx,
    },
    children
  )
}

export const FillBox = ({ sx, ...props }: Mui.BoxProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflowX: "hidden",
        overflowY: "scroll",
        padding: 0,
        margin: 0,
        ...sx,
      }}
      {...props}
    />
  )
}

export const LoadingPage = ({ title }: { title?: string }) => {
  return (
    <FillBox sx={{ justifyContent: "center", alignItems: "center" }}>
      <CircularProgress sx={{ marginBottom: 2 }} />
      <Typography align="center" variant="caption" color="text.secondary">
        {title}
      </Typography>
    </FillBox>
  )
}

export const AspectRatio = ({
  aspectRatio,
  children,
}: {
  aspectRatio: number
  children: ReactNode
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        paddingTop: `${aspectRatio * 100}%`,
        position: "relative",
        height: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </Box>
    </Box>
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
  headerIcon,
  subtitle,
}: {
  open: boolean
  onCancel: () => void
  onClose: () => void
  onConfirm: () => void
  title: string
  subtitle?: string
  confirmTitle: string
  cancelTitle?: string
  headerIcon?: ViewNode
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      {headerIcon && (
        <Box sx={{ margin: "auto", paddingTop: 2, marginBottom: -1 }}>
          {headerIcon}
        </Box>
      )}
      <DialogTitle>{title}</DialogTitle>
      {subtitle && (
        <DialogTitle variant="subtitle2" color="text.secondary">
          {subtitle}
        </DialogTitle>
      )}
      <DialogActions>
        <Button onClick={onCancel}>{cancelTitle}</Button>
        <Button onClick={onConfirm}>{confirmTitle}</Button>
      </DialogActions>
    </Dialog>
  )
}

export const pulse = keyframes`
  0% {
    opacity: 100%;
  }
  50% {
    opacity: 50%;
  }
  100% {
    opacity: 100%;
  }
`

export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const pulseAnimation = `${pulse} 0.5s infinite ease`

export type ViewNode = ReactNode

export type Sx = Mui.SxProps

export const actionButton = ({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string
  icon: ReactNode
  onPress?: () => void
  disabled?: boolean
}) => {
  const theme = useTheme()
  return (
    <ButtonBase
      onClick={onPress}
      sx={{
        paddingY: 1 / 2,
        paddingX: 2,
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        color: disabled
          ? theme.palette.action.disabled
          : theme.palette.action.active,
      }}
    >
      {icon}
      <Typography variant="caption">{label}</Typography>
    </ButtonBase>
  )
}

export const ActionButton = ({
  label,
  icon,
  onClick,
  disabled = false,
}: {
  label: string
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
}) => {
  const theme = useTheme()
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        paddingY: 1 / 2,
        paddingX: 2,
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        color: disabled
          ? theme.palette.action.disabled
          : theme.palette.action.active,
      }}
    >
      {icon}
      <Typography variant="caption">{label}</Typography>
    </ButtonBase>
  )
}


// 
// 
// 
// 
// 
// 


type IconName = "smart-toy" | 'exit' | 'swap' | 'restart'

export const icon = ({ name, ...sx }: { name: IconName } & Sx) => {
  switch (name) {
    case 'smart-toy': {
      return <SmartToy sx={sx} />
    }

    case 'exit': {
      return <ExitToApp sx={{ ...sx, transform: "rotate(180deg)" }} />

    }
    case 'swap': {
      return <SwapHorizSharp sx={sx} />
    }

    case 'restart': {
      return <RestartAlt sx={sx} />
    }
  }
}