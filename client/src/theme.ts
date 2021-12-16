import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: "default",
        elevation: 0,
        position: "sticky",
      },
    },
  },
});
