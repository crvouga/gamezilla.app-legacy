import {
  Button,
  AppBar,
  Box,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

export const EditProfileNamePage = ({
  profile,
}: {
  profile: { userId: string; displayName?: string };
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Name
          </Typography>
          <Button>Done</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 2 }}>
        <TextField
          label="Name"
          value={displayName}
          fullWidth
          sx={{ marginBottom: 2 }}
        />
        <Typography color="text.secondary">
          Help people discover your account by using the name you're known by:
          either your full name, nickname, or business name.
        </Typography>
      </Box>
    </>
  );
};
