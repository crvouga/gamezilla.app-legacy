import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import {
  Button,
  IconArrowLeftOnRect,
  IconRobot,
  IconUsers,
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { ViewGameHeader } from "./view-game-header";
import { ViewUsersInSpaceList } from "./view-users-in-space-list";

type MainMenuButton = {
  renderIcon: (input: { class: string }) => VDom;
  title: string;
  description: string;
  onClick: () => void;
};

const View = ({
  title,
  renderCoverArt,
  buttons,
  ctx,
}: {
  ctx: SpaceClientCtx;
  title: string;
  renderCoverArt: (props: { class: string }) => VDom;
  buttons: MainMenuButton[];
}) => {
  if (ctx.currentUserId !== ctx.space.hostId) {
    return (
      <div class="flex h-full w-full flex-col">
        <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />
        <ViewUsersInSpaceList ctx={ctx} />
      </div>
    );
  }

  return (
    <div class="flex h-full w-full flex-col overflow-y-hidden">
      <div class="flex w-full flex-1 flex-col items-center overflow-y-scroll">
        <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />

        <div class="flex w-full flex-col p-4">
          {buttons.map(({ renderIcon, title, description, onClick }, index) => (
            <button
              class="mb-6 flex w-full items-center rounded-lg bg-neutral-800 p-6 active:opacity-70"
              onClick={onClick}
              key={`${index} ${title}`}
            >
              {renderIcon({
                class: "aspect-square w-12 h-12 mr-4",
              })}
              <div class="flex-1 text-left">
                <p class="text-2xl font-bold">{title}</p>

                {description && (
                  <p class="text-sm text-secondary">{description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div class="flex justify-center border-t border-neutral-700 p-4">
        <Button
          onClick={ctx.quit}
          class="w-full"
          start={<IconArrowLeftOnRect class="h-6 w-6" />}
          text="Quit"
        />
      </div>
    </div>
  );
};

const buttons = {
  playFriend: (input: { onClick: () => void }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (props) => <IconUsers {...props} />,
      title: "Play Friend",
      description: "Play against people in your space",
    };
  },

  playComputer: (input: { onClick: () => void }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (props) => <IconRobot {...props} />,
      title: "Play Computer",
      description: "Play against a computer",
    };
  },
};

export const MainMenuScreen = {
  buttons,
  View,
};
