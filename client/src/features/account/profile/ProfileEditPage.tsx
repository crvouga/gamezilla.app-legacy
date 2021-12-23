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
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "src/App";
import { profile } from "./profile";

export const ProfileEditPage = () => {
  const profileState = useAppSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (profileState?.displayName) {
      setDisplayName(profileState.displayName);
    }
  }, [profileState]);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleDone = () => {
    dispatch(profile.actions.update({ displayName }));
    navigate(-1);
  };

  return (
    <>
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
          src={profileState?.avatarUrl}
          sx={{
            marginX: "auto",
            width: "120px",
            height: "120px",
            marginTop: 2,
            marginBottom: 1 / 2,
          }}
        />

        <Link to="/avatar/edit">
          <Button
            sx={{ display: "block", marginX: "auto", marginBottom: 2 }}
          >
            Change Avatar
          </Button>
        </Link>

        <TextField
          disabled={profileState === null}
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
