import {
  AppBar,
  Box,
  Button,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

export const EditProfileUsernamePage = ({
  profile,
}: {
  profile: { userId: string; username: string };
}) => {
  const [username, setUsername] = useState(profile.username);
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Username
          </Typography>
          <Button>Done</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 2 }}>
        <TextField label="Username" value={username} fullWidth />
      </Box>
    </>
  );
};
