import { Close, Done } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { LoadingDialog } from "src/components/LoadingDialog";
import { useProfileContext } from "src/features";
import { profileDataAccess } from "./profile";

export const ProfileEditPage = () => {
  const profile = useProfileContext();

  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName);
    }
  }, [profile?.displayName, setDisplayName]);

  const handleCancel = () => {
    navigate(-1);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      await profileDataAccess.update({
        ...profile,
        displayName,
      });
    },
    onSuccess: () => {
      navigate(-1);
    },
  });

  const handleDone = () => {
    mutation.mutate();
  };

  return (
    <>
      <LoadingDialog
        title="Updating Profile"
        open={mutation.status === "loading"}
      />

      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={handleCancel}>
            <Close />
          </IconButton>

          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Profile
          </Typography>

          <IconButton edge="end" onClick={handleDone}>
            <Done />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ paddingX: 2 }}>
        <Avatar
          src={profile.avatarUrl}
          sx={{
            marginX: "auto",
            width: "120px",
            height: "120px",
            marginTop: 2,
            marginBottom: 1 / 2,
          }}
        />

        <Link to="/avatar/edit">
          <Button sx={{ display: "block", marginX: "auto", marginBottom: 2 }}>
            Change Avatar
          </Button>
        </Link>

        <TextField
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          label="Display Name"
          fullWidth
          sx={{ marginBottom: 2 }}
        />
      </Box>
    </>
  );
};
