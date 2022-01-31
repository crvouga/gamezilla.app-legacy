import { Box, Typography } from "@mui/material";

export const Splash = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Typography variant="h1">🦖</Typography>
    </Box>
  );
};
