import { Eff } from "gamezilla-app/@SHARED/core"
import { VDom } from "gamezilla-app/@SHARED/vdom"
import { Drawer } from "../@SHARED/ui"
import { StatusBarCmd } from "../@SHARED/client"

export type Model = {
  isDrawerOpen: boolean
}

export const init = (_input: {
  stored: Record<string, unknown> | null
}): { model: Model } => {
  return {
    model: {
      isDrawerOpen: false,
    },
  }
}

export type Msg =
  | { t: "clicked-status-bar" }
  | { t: "closed-status-bar-drawer" }

export const update = (input: {
  model: Model
  msg?: Msg | null
  msgCmd?: StatusBarCmd | null
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  switch (input.msg?.t) {
    case "clicked-status-bar": {
      return { model: { ...input.model, isDrawerOpen: true } }
    }

    case "closed-status-bar-drawer": {
      return { model: { ...input.model, isDrawerOpen: false } }
    }
  }

  switch (input.msgCmd?.t) {
    case "status-bar": {
      switch (input.msgCmd.c.t) {
        case "close": {
          return { model: { ...input.model, isDrawerOpen: false } }
        }
      }
    }
  }

  return { model: input.model }
}

export const View = ({
  model,
  dispatch,
  slots,
}: {
  slots: {
    barLeft: VDom
    barRight: VDom
    drawerContent: VDom
  }
  model: Model
  dispatch: (m: Msg) => void
}) => {
  return (
    <div className="w-full">
      <button
        aria-label="open status bar"
        className="flex w-full items-center gap-2 border-b border-neutral-600 p-0.5 px-2 text-xs text-neutral-300"
        onClick={() => dispatch({ t: "clicked-status-bar" })}
      >
        {slots.barLeft}

        <div className="flex-1"></div>

        {slots.barRight}
      </button>

      <Drawer
        position="top"
        id="drawer"
        open={model.isDrawerOpen}
        onClose={() => dispatch({ t: "closed-status-bar-drawer" })}
      >
        {slots.drawerContent}
      </Drawer>
    </div>
  )
}
