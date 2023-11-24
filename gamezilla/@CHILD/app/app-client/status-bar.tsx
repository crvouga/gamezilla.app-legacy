import { Drawer, IconVolumeHigh } from "../@SHARED/ui";

export const View = () => {
  return (
    <div class="w-full">
      <button class="flex w-full items-center gap-2 border-b border-neutral-800 p-0.5 px-2 text-xs text-secondary">
        <div>Connected</div>
        <div class="flex-1"></div>
        <div>
          <IconVolumeHigh class="h-3 w-3" />
        </div>
      </button>
      <Drawer id="drawer" open={true} onClose={() => {}}>
        settings
      </Drawer>
    </div>
  );
};
