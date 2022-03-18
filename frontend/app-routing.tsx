import { Typography, Box, Button } from "@mui/material";

export const AppRoutingNotFound = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box>
        <Typography variant="h6">Page Not Found</Typography>
        <Button>Back Home</Button>
      </Box>
    </Box>
  );
};
