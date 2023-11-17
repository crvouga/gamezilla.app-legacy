import { IconChevronLeft, IconSpinner } from "./icon";
import { IconButton } from "./icon-button";
import { VDomChildren } from "./utils";

export const TopBar = (input: {
  left?: VDomChildren;
  title: VDomChildren;
  loading?: boolean;
  right?: VDomChildren;
}) => {
  return (
    <div class="min-h-fit w-full">
      <nav class="grid  h-14 w-full grid-cols-5 justify-center border-b border-neutral-700">
        <div class="flex items-center justify-start">{input.left}</div>
        <div class="col-span-3 flex items-center justify-center">
          <p class="text-center text-xl font-semibold">{input.title}</p>
          {input.loading && <IconSpinner class="h-3 w-3 animate-spin" />}
        </div>
        <div class="flex items-center justify-end">{input.right}</div>
      </nav>
    </div>
  );
};

export const TopBarBackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton onClick={onClick}>
      <IconChevronLeft class="h-6 w-6" />
    </IconButton>
  );
};
