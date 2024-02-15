import { VDom } from "gamezilla/@SHARED/vdom"
import { Drawer } from "vaul"
import { DrawerProps } from ".."
import { cn } from "../.."

export const DrawerReact = (props: DrawerProps): VDom => {
  return (
    <Drawer.Root
      open={props.open}
      direction={props.position === "top" ? "top" : "bottom"}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 bg-black/50"
          onClick={() => {
            props.onClose()
          }}
        />
        <Drawer.Content
          className={cn(
            "fixed left-0 right-0 flex flex-col",
            props.position === "top" && "top-0",
            props.position === "bottom" && "bottom-0",
          )}
        >
          <div className="mx-auto w-full max-w-xl flex-1 rounded-xl border border-neutral-600 bg-black">
            <div
              className={cn(
                "flex w-full",
                props.position === "bottom" && "flex-col",
                props.position === "top" && "flex-col-reverse",
              )}
            >
              <div className="flex w-full items-center justify-center py-4">
                <div className="h-1.5 w-12 flex-shrink-0 rounded-full bg-neutral-300" />
              </div>
              <div className="flex w-full flex-1 flex-col">
                {props.children}
              </div>
              <div className="w-full py-3"></div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
