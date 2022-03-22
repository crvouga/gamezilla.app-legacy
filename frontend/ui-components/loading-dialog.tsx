import {
  CircularProgress,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import React from "react";

export const LoadingDialog = ({
  visible,
  title,
}: {
  visible: boolean;
  title: string;
}) => {
  return (
    <Dialog open={visible}>
      <DialogContent sx={{ display: "flex", alignItems: "center" }}>
        <CircularProgress sx={{ marginRight: 2 }} />
        <Typography variant="h6">{title}</Typography>
      </DialogContent>
    </Dialog>
  );
};
