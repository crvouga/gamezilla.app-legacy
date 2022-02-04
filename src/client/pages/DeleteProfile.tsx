import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { ModalLoader } from "../components/ModalLoader";
import { deleteProfile } from "../data-access";

export const DeleteProfilePage = ({ userId }: { userId: string }) => {
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

  if (mutation.status === "loading") {
    return <ModalLoader title="Deleting..." />;
  }

  return (
    <Dialog open onClose={onCancel}>
      <DialogTitle>Delete your profile forever?</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
};
