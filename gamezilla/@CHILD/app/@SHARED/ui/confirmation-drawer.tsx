import { cn } from ".";
import { Button } from "./button";
import { Drawer, DrawerProps } from "./drawer";

type Props = DrawerProps & {
  confirmText: string;
  onConfirm: () => void;
  cancelText?: string;
  onCancel: () => void;
  title: string;
  body: string;
  variant?: "danger";
  confirming?: boolean;
};

export const ConfirmationDrawer = (props: Props) => {
  return (
    <Drawer {...props}>
      <p
        className={cn(
          "w-full px-4 pt-4 text-left text-3xl font-bold"
          //   props.variant === "danger" && "text-red-500"
        )}
      >
        {props.title}
      </p>
      <p className="w-full p-4 text-left text-lg text-secondary">
        {props.body}
      </p>
      <div className="flex w-full items-center gap-4 p-4">
        <Button
          className="flex-1"
          onClick={props.onClose}
          text={props.cancelText ?? "Cancel"}
        />
        <Button
          className="flex-1"
          color={props.variant === "danger" ? "danger" : "default"}
          onClick={props.onConfirm}
          variant="contained"
          text={props.confirmText}
          loading={props.confirming}
        />
      </div>
    </Drawer>
  );
};
