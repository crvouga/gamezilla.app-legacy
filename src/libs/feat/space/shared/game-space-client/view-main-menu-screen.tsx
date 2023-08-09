import {
  Button,
  IconArrowLeftOnRect,
  IconRobot,
  IconUsers,
  VDom,
} from "@gamezilla/ui";
import { SpaceViewCtx } from "./game-space-client";
import { ViewGameHeader } from "./view-game-header";

type MainMenuButton = {
  renderIcon: (input: { className: string }) => VDom;
  title: string;
  description: string;
  onClick: () => void;
};

export const MainMenuScreen = ({
  title,
  renderCoverArt,
  buttons,
  ctx,
}: {
  ctx: SpaceViewCtx;
  title: string;
  renderCoverArt: (props: { className: string }) => VDom;
  buttons: MainMenuButton[];
}) => {
  if (ctx.currentUserId !== ctx.hostId) {
    return (
      <div className="flex h-full w-full flex-col">
        <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />
        {/* <ViewUsersInSpaceList space={space} ctx={ctx} /> */}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-hidden">
      <div className="flex w-full flex-1 flex-col items-center overflow-y-auto">
        <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />

        <div className="flex w-full flex-col gap-6 p-4">
          {buttons.map(({ renderIcon, title, description, onClick }, index) => (
            <button
              className="flex w-full items-center  gap-6 rounded-lg bg-neutral-800 p-6 active:opacity-70"
              onClick={onClick}
              key={`${index} ${title}`}>
              {renderIcon({
                className: "aspect-square w-12 h-12",
              })}
              <div className="flex-1 text-left">
                <p className="text-2xl font-bold">{title}</p>

                {description && (
                  <p className="text-sm text-secondary">{description}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        <div>
          <div className="h-24 w-full"></div>
        </div>
      </div>

      <div className="flex justify-center border-t border-neutral-700 p-4">
        <Button
          onClick={ctx.onQuit}
          className="w-full"
          start={<IconArrowLeftOnRect className="h-6 w-6" />}
          text="Quit"
        />
      </div>
    </div>
  );
};

export const mainMenuButtons = {
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
