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
}: DialogProps & { title?: string }) => {
  return (
    <Dialog {...props}>
      <DialogContent sx={{ display: "flex", alignItems: "center" }}>
        <CircularProgress />
        {title && <Typography sx={{ marginLeft: 2 }}>{title}</Typography>}
      </DialogContent>
    </Dialog>
  );
};
