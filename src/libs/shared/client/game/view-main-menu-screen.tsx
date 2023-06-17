import {
  IconArrowLeftOnRect,
  IconRobot,
  IconUsers,
  MyButton,
  VDom,
} from "@gamezilla/shared/ui";
import { RoomViewCtx } from "./game-shared";
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
  roomCtx,
}: {
  roomCtx: RoomViewCtx;
  title: string;
  renderCoverArt: (props: { className: string }) => VDom;
  buttons: MainMenuButton[];
}) => {
  if (roomCtx.currentUserId !== roomCtx.hostId) {
    return (
      <div className="w-full h-full flex items-center justify-center flex-col">
        <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-y-hidden">
      <div className="w-full flex-1 flex flex-col items-center px-4 overflow-y-auto">
        <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />

        <div className="w-full flex flex-col gap-6 mt-6">
          {buttons.map(({ renderIcon, title, description, onClick }, index) => (
            <button
              className="gap-6 flex w-full p-6 items-center bg-neutral-800 rounded-lg active:opacity-70"
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
      </div>

      <div className="p-4 flex justify-center">
        <MyButton onClick={roomCtx.onQuit} className="w-full gap-4">
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
