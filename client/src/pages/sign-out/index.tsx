import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { auth } from "src/features";

export const SignOutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/account");
  };

  return (
    <Dialog open onClose={handleCancel}>
      <DialogTitle>Sign Out of Gamezilla?</DialogTitle>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={() => dispatch(auth.actions.signOut())}>
          Sign Out
        </Button>
      </DialogActions>
    </Dialog>
  );
};
