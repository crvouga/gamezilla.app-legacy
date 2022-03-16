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
import { Link } from "react-router-dom";
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

        <Link to="avatar">
          <Button>Edit Avatar</Button>
        </Link>
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
