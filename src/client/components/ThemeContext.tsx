import {
  createTheme,
  CssBaseline,
  LinkBaseProps,
  responsiveFontSizes,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";
import React from "react";
import { Link } from "react-location";

const LinkBehavior = React.forwardRef<any, Partial<LinkBaseProps>>(
  (props, _ref) => {
    return (
      <Link to={props.href} {...props}>
        {props.children}
      </Link>
    );
  }
);

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        position: "sticky",
        elevation: 0,
        color: "transparent",
        sx: {
          borderBottom: "2px solid rgba(0, 0, 0, 0.5)",
        },
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },

    MuiLink: {
      defaultProps: {
        //@ts-ignore
        component: LinkBehavior,
      },
    },

    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      },
    },
  },
});

const theme = responsiveFontSizes(darkTheme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
