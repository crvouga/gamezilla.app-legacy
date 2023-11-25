import { Drawer, IconVolumeHigh, VDom } from "../@SHARED/ui";

export type Model = {
  isDrawerOpen: boolean;
};

export const init = ({
  stored,
}: {
  stored: Model | null;
}): { model: Model } => {
  if (stored) {
    return { model: stored };
  }

  return {
    model: {
      isDrawerOpen: false,
    },
  };
};

export type Msg = { t: "clicked-status-bar" } | { t: "closed-drawer" };

export const update = (input: { model: Model; msg: Msg }): { model: Model } => {
  switch (input.msg.t) {
    case "clicked-status-bar": {
      return { model: { ...input.model, isDrawerOpen: true } };
    }

    case "closed-drawer": {
      return { model: { ...input.model, isDrawerOpen: false } };
    }
  }
};

export const View = ({
  model,
  dispatch,
  wire,
}: {
  wire: {
    statusBar: VDom;
    drawer: VDom;
  };
  model: Model;
  dispatch: (m: Msg) => void;
}) => {
  return (
    <div class="w-full">
      <button
        class="flex w-full items-center gap-2 border-b border-neutral-700 p-0.5 px-2 text-xs text-secondary"
        onClick={() => dispatch({ t: "clicked-status-bar" })}>
        {wire.statusBar}

        <div class="flex-1"></div>

        <div>
          <IconVolumeHigh class="h-3 w-3" />
        </div>
      </button>

      <Drawer
        position="top"
        id="drawer"
        open={model.isDrawerOpen}
        onClose={() => dispatch({ t: "closed-drawer" })}>
        {wire.drawer}
      </Drawer>
    </div>
  );
};
