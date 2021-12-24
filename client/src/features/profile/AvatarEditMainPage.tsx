import { ArrowBack, Casino, ChevronRight } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingDialog } from "src/components/LoadingDialog";
import { formatAvatarStyle, toAvatarSeed } from "./avatar";
import { useAvatarEditContext } from "./AvatarEditContext";

export const AvatarEditMainPage = () => {
  const {
    isTouched,
    avatarUrl,
    reset,
    avatarStyle,
    mutation,
    setAvatarSeed,
  } = useAvatarEditContext();

  const navigate = useNavigate();

  const onSave = () => {
    mutation.mutate();
  };

  const onGenerateRandom = () => {
    setAvatarSeed(toAvatarSeed(String(Math.random())));
  };

  const onBack = () => {
    navigate(-1);
  };

  const onCancel = () => {
    reset();
  };

  return (
    <>
      <LoadingDialog
        open={mutation.status === "loading"}
        title="Updating Avatar"
      />

      {!isTouched && (
        <AppBar position="sticky">
          <Toolbar>
            <IconButton edge="start" onClick={onBack}>
              <ArrowBack />
            </IconButton>

            <Typography variant="h6" sx={{ flex: 1 }}>
              Edit Avatar
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {isTouched && (
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Save Changes?
            </Typography>

            <Button size="small" sx={{ marginRight: 1 }} onClick={onCancel}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={onSave}>
              Save
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <Avatar
        src={avatarUrl}
        sx={{
          marginX: "auto",
          width: "160px",
          height: "160px",
          marginY: 2,
        }}
      />

      <List>
        <Link to="choose">
          <ListItem button>
            <ListItemAvatar>
              <Avatar src={avatarUrl} />
            </ListItemAvatar>
            <ListItemText
              primary={formatAvatarStyle(avatarStyle)}
              secondary="Choose Style"
            />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItem>
        </Link>
      </List>

      <Box sx={{ paddingX: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<Casino />}
          onClick={onGenerateRandom}
        >
          Random
        </Button>
      </Box>
    </>
  );
};
