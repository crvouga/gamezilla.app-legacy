import { Logout } from "@mui/icons-material";
import { Box, Button, Dialog, Typography } from "@mui/material";
import React from "react";

export const LogoutDialog = ({
  onCancel,
  onLogout,
}: {
  onCancel: () => void;
  onLogout: () => void;
}) => {
  return (
    <Dialog open>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          placeItems: "center",
          paddingX: 2,
          paddingY: 2,
        }}
      >
        <Logout
          sx={{
            width: "3rem",
            height: "3rem",
            marginRight: -2,
            marginBottom: 2,
          }}
        />

        <Typography variant="h5" sx={{ marginBottom: 2, paddingX: 2 }}>
          Log out of Gamezilla?
        </Typography>

        <Button
          variant="outlined"
          fullWidth
          sx={{ marginBottom: 2 }}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button variant="contained" fullWidth onClick={onLogout}>
          Logout
        </Button>
      </Box>
    </Dialog>
  );
};
