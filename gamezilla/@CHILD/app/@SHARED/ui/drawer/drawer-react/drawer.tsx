import { VDom } from "gamezilla/@SHARED/vdom"
import { Drawer } from "vaul"
import { DrawerProps } from ".."

export const DrawerReact = (props: DrawerProps): VDom => {
  return (
    <Drawer.Root
      shouldScaleBackground
      open={props.open}
      onClose={props.onClose}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex flex-col">
          <div className="mx-auto w-full max-w-xl flex-1 rounded-xl border border-neutral-600 bg-black">
            <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-neutral-300" />
            {props.children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
