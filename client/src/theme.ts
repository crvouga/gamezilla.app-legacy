import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiAvatar: {
      styleOverrides: {
        img: {
          // backgroundColor: "white",
        },
      },
    },
  },
});
