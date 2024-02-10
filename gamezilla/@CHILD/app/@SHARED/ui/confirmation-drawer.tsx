import { cn } from "."
import { Button } from "./button"
import { Drawer, DrawerProps } from "./drawer"

type Props = DrawerProps & {
    title: string
    body: string
    variant?: "danger"
    //
    cancelText?: string
    cancelDisabled?: boolean
    onCancel: () => void
    //
    confirmText: string
    onConfirm: () => void
    confirmLoading?: boolean
}

export const ConfirmationDrawer = (props: Props) => {
    return (
        <Drawer {...props}>
            <p
                className={cn(
                    "w-full px-4 pt-4 text-left text-3xl font-bold",
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
                    onClick={props.onCancel}
                    text={props.cancelText ?? "Cancel"}
                    disabled={props.cancelDisabled}
                />
                <Button
                    className="flex-1"
                    color={props.variant === "danger" ? "danger" : "default"}
                    onClick={props.onConfirm}
                    variant="contained"
                    text={props.confirmText}
                    loading={props.confirmLoading}
                />
            </div>
        </Drawer>
    )
}
