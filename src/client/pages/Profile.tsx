import { Edit } from "@mui/icons-material";
import { Avatar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import React from "react";
export const ProfilePage = ({
  profile,
}: {
  profile: { username: string; avatarUrl?: string };
}) => {
  return (
    <>
      <Toolbar sx={{ alignItems: "center" }}>
        <Typography sx={{ flex: 1 }} variant="h4">
          {profile.username}
        </Typography>

        <IconButton>
          <Edit />
        </IconButton>
      </Toolbar>

      <Box
        sx={{
          padding: 4,
          width: "100%",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Avatar
          sx={{ width: 120, height: 120, marginBottom: 2 }}
          src={profile.avatarUrl}
        />
        <Typography align="center" variant="h6">
          {profile.username}
        </Typography>
      </Box>
    </>
  );
};
