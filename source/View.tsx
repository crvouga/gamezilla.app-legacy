import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import {
  Backdrop,
  Box,
  BoxProps,
  CircularProgress,
  createTheme,
  CssBaseline,
  IconButton,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  responsiveFontSizes,
  ThemeProvider as MuiThemeProvider,
  Toolbar,
  Typography as MuiTypography,
  TypographyProps,
  useTheme,
} from "@mui/material";
import { green } from "@mui/material/colors";
import * as React from "react";

//
// theme
//

const theme = responsiveFontSizes(
  createTheme({
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
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

//
//
//

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
      <ChevronRight />
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
    <Toolbar>
      <Box sx={{ flex: 1 }}>{left}</Box>

      <Typography sx={{ flex: 2 }} align="center" variant="h6">
        {title}
      </Typography>

      <Box sx={{ flex: 1 }}>{right}</Box>
    </Toolbar>
  );
};

export const HeaderBackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton edge="start" onClick={onClick}>
      <ChevronLeft />
    </IconButton>
  );
};

export const Button = (props: LoadingButtonProps) => {
  return <LoadingButton {...props} />;
};

export const Typography = (props: TypographyProps) => {
  return <MuiTypography {...props} />;
};

export const Page = ({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: BoxProps["sx"];
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        maxWidth: "sm",
        marginX: "auto",
        position: "fixed",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        border: {
          sm: `2px ${theme.palette.divider} solid`,
        },
        maxHeight: {
          sm: "900px",
        },
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
    <Backdrop sx={{ zIndex: 10 }} open={Boolean(open)}>
      <CircularProgress />
    </Backdrop>
  );
};
