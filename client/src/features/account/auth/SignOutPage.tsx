import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";

import { useNavigate } from "react-router-dom";

export const SignOutPage = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/account");
  };

  return (
    <Dialog open onClose={handleCancel}>
      <DialogTitle>Sign Out of Gamezilla?</DialogTitle>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button>Sign Out</Button>
      </DialogActions>
    </Dialog>
  );
};
