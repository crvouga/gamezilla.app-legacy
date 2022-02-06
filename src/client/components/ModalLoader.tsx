import {
  CircularProgress,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";

export const ModalLoader = ({
  open = true,
  title,
}: {
  open?: boolean;
  title: string;
}) => {
  return (
    <Dialog open={open}>
      <DialogContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ marginRight: 4 }} />
        <Typography variant="h6">{title}</Typography>
      </DialogContent>
    </Dialog>
  );
};
