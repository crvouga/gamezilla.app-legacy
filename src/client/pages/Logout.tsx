import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { ModalLoader } from "../components/ModalLoader";
import { logout } from "../data-access";

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

  if (mutation.status === "loading") {
    return <ModalLoader title="Logging out..." />;
  }

  return (
    <Dialog open onClose={onCancel}>
      <DialogTitle>Logout of Gamezilla?</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm}>Logout</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Logout;
