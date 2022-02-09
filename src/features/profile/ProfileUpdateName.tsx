import { LoadingButton } from "@mui/lab";
import { ChevronLeft } from "@mui/icons-material";
import {
  IconButton,
  AppBar,
  Box,
  Button,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "./profile-data-access";

const ProfileUpdateName = ({
  profile,
}: {
  profile: { userId: string; name?: string };
}) => {
  const [name, setName] = useState(profile.name);

  const navigate = useNavigate();

  const mutation = useMutation(updateProfile, {
    onSuccess: () => {
      navigate(-1);
    },
  });

  const onDone = () => {
    mutation.mutate({
      userId: profile.userId,
      name,
    });
  };

  const onCancel = () => {
    setName(profile.name);
  };

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
            Edit Name
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 2 }}>
        <TextField
          label="Name"
          value={name}
          fullWidth
          sx={{ marginBottom: 2 }}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
        <Typography color="text.secondary">
          Help people discover your account by using the name you're known by:
          either your full name, nickname, or business name.
        </Typography>
      </Box>

      <Toolbar sx={{ justifyContent: "flex-end" }}>
        <Button onClick={onCancel} variant="contained" sx={{ marginRight: 2 }}>
          Cancel
        </Button>
        <LoadingButton
          loading={mutation.status === "loading"}
          onClick={onDone}
          variant="contained"
        >
          Done
        </LoadingButton>
      </Toolbar>
    </>
  );
};

export default ProfileUpdateName;
