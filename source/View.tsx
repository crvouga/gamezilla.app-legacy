import * as MuiIcons from "@mui/icons-material";
import * as MuiLab from "@mui/lab";
import * as Mui from "@mui/material";
import { green } from "@mui/material/colors";
import { html, platform } from "Framework";
import { createRoot } from "react-dom/client";

//
//
//
// Model
//
//
//

type Dom = React.ReactElement<unknown>;

export type View<Msg> = (dispatch: platform.Dispatch<Msg>) => Dom;

export const map = <A, Msg>(
  f: (a: A) => Msg
): ((ha: html.Html<Dom, A>) => html.Html<Dom, Msg>) => {
  return html.map(f);
};

//
//
//
// Theme
//
//
//

const theme = Mui.responsiveFontSizes(
  Mui.createTheme({
    palette: {
      mode: "dark",
      primary: green,
    },
    typography: {
      fontFamily: ["Nunito"].join(","),
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
  })
);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Mui.ThemeProvider theme={theme}>
      <Mui.CssBaseline />
      {children}
    </Mui.ThemeProvider>
  );
};

export const useTheme = Mui.useTheme;

//
//
//
// Components
//
//
//

export const Icons = MuiIcons;

export const TextField = Mui.TextField;

export const Snackbar = Mui.Snackbar;

export const Box = Mui.Box;

export const Divider = Mui.Divider;

export const ListItemButton = Mui.ListItemButton;

export const Chip = Mui.Chip;

export const ListItemText = Mui.ListItemText;

export const ListItemIcon = Mui.ListItemIcon;

export const ListItemSecondaryAction = Mui.ListItemSecondaryAction;

export const Button = MuiLab.LoadingButton;

export const Typography = Mui.Typography;

export const Dialog = Mui.Dialog;

export const DialogTitle = Mui.DialogTitle;

export const DialogActions = Mui.DialogActions;

export const CircularProgress = Mui.CircularProgress;

export const ListItemAvatar = Mui.ListItemAvatar;

export const Avatar = Mui.Avatar;

export const MenuItem = Mui.MenuItem;

export const Autocomplete = Mui.Autocomplete;

export const Select = Mui.Select;

export const List = Mui.List;

export const ButtonBase = Mui.ButtonBase;

export const Toolbar = Mui.Toolbar;

export const IconButton = Mui.IconButton;

export const Field = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
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
);

export const Header = ({
  left,
  title,
  right,
}: {
  left?: React.ReactNode;
  title: React.ReactNode;
  right?: React.ReactNode;
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
  );
};

export const HeaderBackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Mui.IconButton edge="start" onClick={onClick}>
      <Icons.ChevronLeft />
    </Mui.IconButton>
  );
};

export const Page = ({ children, sx }: Mui.BoxProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export const LoadingPage = () => {
  return (
    <Page sx={{ justifyContent: "center", alignItems: "center" }}>
      <CircularProgress />
    </Page>
  );
};

export const LoadingBackdrop = ({ open }: { open?: boolean }) => {
  return (
    <Mui.Backdrop sx={{ zIndex: 10 }} open={Boolean(open)}>
      <CircularProgress />
    </Mui.Backdrop>
  );
};

export const LoadingDialog = ({
  open,
  title,
}: {
  open: boolean;
  title: string;
}) => {
  return (
    <Dialog open={open}>
      <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <CircularProgress sx={{ marginRight: 2 }} />
        <Typography variant="h6">{title}</Typography>
      </Box>
    </Dialog>
  );
};

export const ConformationDialog = ({
  open,
  onCancel,
  onClose,
  onConfirm,
  title,
  confirmTitle,
  cancelTitle = "Cancel",
}: {
  open: boolean;
  onCancel: () => void;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmTitle: string;
  cancelTitle?: string;
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>{cancelTitle}</Button>
        <Button onClick={onConfirm}>{confirmTitle}</Button>
      </DialogActions>
    </Dialog>
  );
};
