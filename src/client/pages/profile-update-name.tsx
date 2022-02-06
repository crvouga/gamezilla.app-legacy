import {
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
import { BackButton } from "../components/back-button";
import { ModalLoader } from "../components/modal-loader";
import { updateProfile } from "../data-access";

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
      <ModalLoader open={mutation.status === "loading"} title="Updating..." />

      <AppBar>
        <Toolbar>
          <BackButton />
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
          helperText="Help people discover your account by using the name you're known by:
          either your full name, nickname, or business name."
        />
        {/* <Typography color="text.secondary"></Typography> */}
      </Box>

      <AppBar>
        <Toolbar sx={{ justifyContent: "flex-end" }}>
          <Button
            onClick={onCancel}
            variant="contained"
            sx={{ marginRight: 2 }}
          >
            Cancel
          </Button>
          <Button onClick={onDone} variant="contained">
            Done
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default ProfileUpdateName;
