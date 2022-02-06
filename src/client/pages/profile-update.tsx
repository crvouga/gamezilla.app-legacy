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
import { BackButton } from "../components/back-button";
import { Link, LinkBehavior } from "../components/link";
import { ListItemField } from "../components/list-item-field";

const ProfileUpdate = ({
  profile,
}: {
  profile: { avatarUrl?: string; username?: string; name?: string };
}) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <BackButton />
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

        <Button href="/profile/edit/avatar" LinkComponent={LinkBehavior}>
          Edit Avatar
        </Button>
      </Box>

      <List>
        <Link href="/profile/edit/username">
          <ListItemField label="Username" value={profile.username} />
        </Link>

        <Link href="/profile/edit/name">
          <ListItemField label="Name" value={profile.name} />
        </Link>
      </List>
    </>
  );
};

export default ProfileUpdate;
