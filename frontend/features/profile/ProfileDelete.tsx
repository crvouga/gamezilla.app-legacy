import { LoadingButton } from "@mui/lab";
import { Box, Button, Drawer, Typography } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../app-store";
import * as Profile from "./profile-state";

const ProfileDelete = ({ userId }: { userId: string }) => {
  const dispatch = useAppDispatch();
  const isDeleting = useAppSelector(
    (state) => true
    // state.profile.type === "found" && state.profile.status === "deleting"
  );

  const onCancel = () => {};

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
          loading={isDeleting}
          size="large"
          onClick={() => {
            // dispatch(Profile.Actions.delete({ userId }));
          }}
        >
          Delete
        </LoadingButton>
      </Box>
    </Drawer>
  );
};

export default ProfileDelete;
