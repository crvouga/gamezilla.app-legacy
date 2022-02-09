import { createTheme, responsiveFontSizes } from "@mui/material";
import { green } from "@mui/material/colors";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: green,
    background: {
      default: "#000",
      paper: "#232323",
    },
  },
  typography: {
    fontSize: 18,
    fontFamily: [
      "Nunito",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#000",
        },
      },
    },

    MuiAppBar: {
      defaultProps: {
        position: "static",
        elevation: 0,
        color: "transparent",
      },
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: "outlined",
      },
    },

    MuiAlert: {
      defaultProps: {
        variant: "filled",
      },
      styleOverrides: {
        root: {
          width: "100%",
        },
      },
    },
  },
});

const theme = responsiveFontSizes(darkTheme);

export default theme;
