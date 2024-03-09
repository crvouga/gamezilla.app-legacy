import { Eff } from "gamezilla-app/@SHARED/core"
import { Drawer } from "../@SHARED/ui"
import { VDom } from "gamezilla-app/@SHARED/vdom"

export type Model = {
  isDrawerOpen: boolean
}

export const init = ({
  stored,
}: {
  stored: Model | null
}): { model: Model } => {
  if (stored) {
    return { model: stored }
  }

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
  msg: Msg | null
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (!input.msg) {
    return { model: input.model }
  }

  switch (input.msg.t) {
    case "clicked-status-bar": {
      return { model: { ...input.model, isDrawerOpen: true } }
    }

    case "closed-status-bar-drawer": {
      return { model: { ...input.model, isDrawerOpen: false } }
    }
  }
}

export const View = ({
  model,
  dispatch,
  wire,
  sound,
}: {
  wire: {
    statusBar: VDom
    drawer: VDom
  }
  sound: {
    statusBar: VDom
    drawer: VDom
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
        {wire.statusBar}

        <div className="flex-1"></div>

        {sound.statusBar}
      </button>

      <Drawer
        position="top"
        id="drawer"
        open={model.isDrawerOpen}
        onClose={() => dispatch({ t: "closed-status-bar-drawer" })}
      >
        {wire.drawer}

        {sound.drawer}
      </Drawer>
    </div>
  )
}
