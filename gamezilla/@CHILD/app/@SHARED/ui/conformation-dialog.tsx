import { Button } from "./button";
import { VDom, cn } from "./utils";

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
      class={cn(
        "absolute left-0 top-0 grid h-full w-full place-items-center",
        open ? "block" : "hidden"
      )}
      onClick={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }
        onClose();
      }}>
      <div class="flex w-80 flex-col gap-6 rounded-lg bg-neutral-900 p-6">
        <p class="text-center text-xl font-semibold">{title}</p>

        <div class="flex w-full items-center gap-4">
          <Button
            variant="outlined"
            onClick={(event) => {
              event.stopPropagation();
              onCancel();
            }}
            class="flex-1"
            text={cancelTitle}
          />

          <Button
            variant="contained"
            color="danger"
            onClick={(event) => {
              event.stopPropagation();
              onConfirm();
            }}
            class="flex-1"
            text={confirmTitle}
          />
        </div>
      </div>
    </div>
  );
};
