import { VDom, cn } from ".";
import { MyButton } from "./button";

export const ConformationDialog = ({
  open,
  onCancel,
  onClose,
  onConfirm,
  title,
  confirmTitle,
  cancelTitle = "Cancel",
}: {
  open: boolean;
  onCancel: () => void;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  confirmTitle: string;
  cancelTitle?: string;
  headerIcon?: VDom;
}) => {
  return (
    <div
      className={cn(
        "absolute left-0 top-0 grid h-full w-full place-items-center",
        open ? "block" : "hidden"
      )}
      onClick={onClose}>
      <div className="flex w-80 flex-col gap-6 rounded-lg bg-neutral-900 p-6">
        <p className="text-center text-xl font-semibold">{title}</p>

        <div className="flex w-full items-center gap-4">
          <MyButton
            variant="outlined"
            onClick={(event) => {
              event.stopPropagation();
              onCancel();
            }}
            className="flex-1">
            {cancelTitle}
          </MyButton>
          <MyButton
            variant="contained"
            color="danger"
            onClick={onConfirm}
            className="flex-1">
            {confirmTitle}
          </MyButton>
        </div>
      </div>
    </div>
  );
};
