import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { Backdrop } from "./Backdrop";

const classNames = {
  action: "flex-1 p-4 uppercase font-bold hover:opacity-70 active:opacity-50",
};

export const ModalConformation = ({
  title,
  left,
  right,
  onBackdropClick,
}: {
  title: string;
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
