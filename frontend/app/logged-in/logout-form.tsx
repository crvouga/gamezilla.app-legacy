import { Box, Button, Dialog, Typography } from "@mui/material";
import React from "react";

export const LogoutForm = ({
  onCancel,
  onLogout,
}: {
  onCancel: () => void;
  onLogout: () => void;
}) => {
  return (
    <Dialog open onClose={onCancel}>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          placeItems: "center",
          paddingX: 2,
          paddingY: 2,
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2, paddingX: 2 }}>
          Log out of Gamezilla?
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={onLogout}
          sx={{ marginBottom: 2 }}
        >
          Logout
        </Button>

        <Button variant="outlined" fullWidth onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Dialog>
  );
};
