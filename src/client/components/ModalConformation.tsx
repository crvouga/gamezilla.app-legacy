import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";

export const ModalConformation = ({
  title,
  left,
  right,
  onBackdropClick,
}: {
  title: React.ReactNode;
  onBackdropClick?: () => void;
  left: {
    title: string;
    onClick: () => void;
  };
  right: {
    title: string;
    onClick: () => void;
  };
}) => {
  return (
    <Dialog open onClose={onBackdropClick}>
      <DialogTitle>{title}</DialogTitle>
      <DialogActions>
        <Button onClick={left.onClick}>{left.title}</Button>
        <Button onClick={right.onClick}>{right.title}</Button>
      </DialogActions>
    </Dialog>
  );
};
