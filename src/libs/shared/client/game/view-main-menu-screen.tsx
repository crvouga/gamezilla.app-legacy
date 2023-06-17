import {
  IconArrowLeftOnRect,
  IconRobot,
  IconUsers,
  MyButton,
  VDom,
} from "@gamezilla/shared/ui";
import { RoomViewCtx } from "./game-shared";
import { ViewGameHeader } from "./view-game-header";
import { ViewUsersInRoomList } from ".";

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
  ctx: RoomViewCtx;
  title: string;
  renderCoverArt: (props: { className: string }) => VDom;
  buttons: MainMenuButton[];
}) => {
  if (ctx.currentUserId !== ctx.hostId) {
    return (
      <div className="flex h-full w-full flex-col gap-6">
        <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />
        <ViewUsersInRoomList ctx={ctx} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-hidden">
      <div className="flex w-full flex-1 flex-col items-center overflow-y-auto px-4">
        <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />

        <div className="mt-6 flex w-full flex-col gap-6">
          {buttons.map(({ renderIcon, title, description, onClick }, index) => (
            <button
              className="flex w-full items-center gap-6 rounded-lg bg-neutral-800 p-6 active:opacity-70"
              onClick={onClick}
              key={`${index} ${title}`}>
              {renderIcon({
                className: "aspect-square w-12 h-12",
              })}
              <div className="flex-1 text-left">
                <p className="text-xl font-bold">{title}</p>
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

      <div className="flex justify-center p-4">
        <MyButton onClick={ctx.onQuit} className="w-full gap-4">
          <IconArrowLeftOnRect />
          Quit
        </MyButton>
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
