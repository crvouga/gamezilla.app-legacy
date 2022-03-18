import {
  AppBar,
  Avatar,
  Box,
  Button,
  List,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { BackButton, ListItemField } from "../../../ui";

const ProfileUpdate = ({
  profile,
}: {
  profile: { avatarUrl?: string; username?: string; name?: string };
}) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <BackButton to="/" />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          padding: 2,
          width: "100%",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Avatar
          sx={{
            width: 120,
            height: 120,
            marginBottom: 1,
          }}
          src={profile.avatarUrl}
        />

        <Button>Edit Avatar</Button>
      </Box>

      <List>
        <ListItemField
          to="username"
          label="Username"
          value={profile.username}
        />

        <ListItemField to="name" label="Name" value={profile.name} />
      </List>
    </>
  );
};

export default ProfileUpdate;
