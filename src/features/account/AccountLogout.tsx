import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "./account-data-access";

const Logout = () => {
  const navigate = useNavigate();

  const mutation = useMutation(logout, {
    onSuccess: () => {
      navigate("/", { replace: true });
    },
  });

  const onConfirm = () => {
    mutation.mutate();
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <Dialog open onClose={onCancel}>
      <DialogTitle>Logout of Gamezilla?</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <LoadingButton
          loading={mutation.status === "loading"}
          onClick={onConfirm}
        >
          Logout
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default Logout;
