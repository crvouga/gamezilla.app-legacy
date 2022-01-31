import { ChevronRight } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  List,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link, LinkBehavior } from "../components/Link";

export const EditProfilePage = ({
  profile,
}: {
  profile: { avatarUrl?: string; username?: string; name?: string };
}) => {
  return (
    <>
      <AppBar>
        <Toolbar>
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
          sx={{ width: 120, height: 120, marginBottom: 2 }}
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

const ListItemField = ({ label, value }: { label: string; value?: string }) => {
  return (
    <ListItemButton>
      <ListItemText
        primaryTypographyProps={{
          variant: "body1",
        }}
        primary={label}
        secondaryTypographyProps={{
          variant: "body1",
          color: value ? "text.primary" : "text.disabled",
        }}
        secondary={value ?? label}
      />
      <ListItemSecondaryAction>
        <ChevronRight />
      </ListItemSecondaryAction>
    </ListItemButton>
  );
};
