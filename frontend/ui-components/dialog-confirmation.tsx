import { Box, Button, Dialog, Typography } from "@mui/material";
import React from "react";

export const DialogConformation = ({
  title,
  confirmTitle,
  onCancel,
  onConfirm,
}: {
  title: string;
  confirmTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  return (
    <Dialog open onClose={onCancel}>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          placeItems: "center",
          paddingX: 2,
          paddingY: 2,
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2, paddingX: 2 }}>
          {title}
        </Typography>

        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          sx={{ marginBottom: 2 }}
        >
          Cancel
        </Button>

        <Button variant="contained" fullWidth onClick={onConfirm}>
          {confirmTitle}
        </Button>
      </Box>
    </Dialog>
  );
};
