import { LoadingButton } from "@mui/lab";
import { Drawer, Box, Button, Typography } from "@mui/material";
import React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { deleteProfile } from "./profile-data-access";

const ProfileDelete = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();

  const mutation = useMutation(deleteProfile);

  const onConfirm = () => {
    mutation.mutate({ userId });
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <Drawer open anchor="bottom" onBackdropClick={onCancel}>
      <Typography sx={{ p: 2 }} align="center" variant="h5">
        Delete your profile forever?
      </Typography>

      <Box
        sx={{
          width: "100%",
          p: 2,
          display: "flex",
        }}
      >
        <Button
          variant="outlined"
          sx={{ flex: 1, marginRight: 2 }}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <LoadingButton
          sx={{ flex: 1 }}
          variant="contained"
          loading={mutation.status === "loading"}
          size="large"
          onClick={onConfirm}
        >
          Delete
        </LoadingButton>
      </Box>
    </Drawer>
  );
};

export default ProfileDelete;
