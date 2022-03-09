import { ListItemField } from "../../ui";
import { ChevronLeft } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const ProfileUpdate = ({
  profile,
}: {
  profile: { avatarUrl?: string; username?: string; name?: string };
}) => {
  const navigate = useNavigate();
  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ChevronLeft />
          </IconButton>
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

        <Link to="/profile/edit/avatar">
          <Button>Edit Avatar</Button>
        </Link>
      </Box>

      <List>
        <ListItemField
          to="/profile/edit/username"
          label="Username"
          value={profile.username}
        />

        <ListItemField
          to="/profile/edit/name"
          label="Name"
          value={profile.name}
        />
      </List>
    </>
  );
};

export default ProfileUpdate;
