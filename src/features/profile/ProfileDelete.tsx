import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { deleteProfile } from "./profile-data-access";

const ProfileDelete = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();

  const mutation = useMutation(deleteProfile, {
    onSuccess: () => {
      navigate("/", { replace: true });
    },
  });

  const onConfirm = () => {
    mutation.mutate({ userId });
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <Dialog open onClose={onCancel}>
      <DialogTitle>Delete your profile forever?</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <LoadingButton
          loading={mutation.status === "loading"}
          onClick={onConfirm}
        >
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDelete;
