import { Box, Typography } from "@mui/material";

export const Splash = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Typography variant="h3" color="primary.main">
        Gamezilla
      </Typography>
    </Box>
  );
};
