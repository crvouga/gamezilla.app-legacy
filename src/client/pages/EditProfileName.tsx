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
import { BackButton } from "../components/BackButton";
import { ModalLoader } from "../components/ModalLoader";
import { updateProfile } from "../data-access";

export const EditProfileNamePage = ({
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

  return (
    <>
      <ModalLoader open={mutation.status === "loading"} title="Updating..." />

      <AppBar>
        <Toolbar>
          <BackButton />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Name
          </Typography>
          <Button onClick={onDone}>Done</Button>
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
    </>
  );
};
