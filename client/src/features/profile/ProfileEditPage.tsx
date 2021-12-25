import { ArrowBack } from "@mui/icons-material";
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
import { useNavigate } from "react-router-dom";
import { LoadingDialog } from "src/components/LoadingDialog";
import { useLoginSession } from "src/features";
import { profileDataAccess } from "./profile";

export const ProfileEditPage = () => {
  const { profile } = useLoginSession();

  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile.displayName ?? "");

  useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName);
    }
  }, [profile?.displayName, setDisplayName]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCancel = () => {
    setDisplayName(profile.displayName ?? "");
  };

  const mutation = useMutation({
    mutationFn: () => {
      return profileDataAccess.update({
        ...profile,
        displayName,
      });
    },
  });

  const handleSave = () => {
    mutation.mutate();
  };

  const touched = profile.displayName !== displayName;

  return (
    <>
      <LoadingDialog
        title="Updating Profile"
        open={mutation.status === "loading"}
      />

      {!touched && (
        <AppBar position="sticky">
          <Toolbar>
            <IconButton edge="start" onClick={handleBack}>
              <ArrowBack />
            </IconButton>

            <Typography variant="h6" sx={{ flex: 1 }}>
              Edit Profile
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {touched && (
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Save Changes?
            </Typography>

            <Button size="small" sx={{ marginRight: 1 }} onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ paddingX: 2 }}>
        <Avatar
          src={profile.avatarUrl}
          onClick={() => {
            navigate("/avatar/edit");
          }}
          sx={{
            marginX: "auto",
            width: "100px",
            height: "100px",
            marginTop: 2,
            marginBottom: 1 / 2,
          }}
        />

        <Button
          onClick={() => {
            navigate("/avatar/edit");
          }}
          sx={{
            display: "block",
            marginX: "auto",
            marginBottom: 2,
          }}
        >
          Edit Avatar
        </Button>

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
