import {
  CircularProgress,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import { DialogProps } from "@mui/material/Dialog";
import React from "react";

export const LoadingDialog = ({
  title,
  ...props
}: DialogProps & { title: string }) => {
  return (
    <Dialog {...props}>
      <DialogContent sx={{ display: "flex", alignItems: "center" }}>
        <CircularProgress sx={{ marginRight: 2 }} />
        <Typography>{title}</Typography>
      </DialogContent>
    </Dialog>
  );
};
