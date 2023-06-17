import { UserId } from "@gamezilla/shared/app";
import { IconArrowLeftOnRect, MyButton, VDom } from "@gamezilla/shared/ui";
import { ViewGameHeader } from "./view-game-header";

export const VsBotSetupScreen = ({
  title,
  renderCoverArt,
  onQuit,
  playerOne,
  playerTwo,
}: {
  botName: string;
  userId: UserId | null;
  playerOne: PlayerProp;
  playerTwo: PlayerProp;
  title: string;
  renderCoverArt: (props: { className: string }) => VDom;
  onQuit: () => void;
}) => {
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <ViewGameHeader renderCoverArt={renderCoverArt} title={title} />

      <div className="grid-cols-10">
        <div className="col-span-5">
          {playerOne.renderIcon({ className: "w-16 h-16" })}
        </div>
        <div className="col-span-5">
          {playerTwo.renderIcon({ className: "w-16 h-16" })}
        </div>
      </div>

      <div className="flex-1"></div>
      <div className="p-4">
        <MyButton className="w-full" onClick={onQuit}>
          <IconArrowLeftOnRect />
          Quit
        </MyButton>
      </div>
    </div>
  );
};

type BasePlayerProp = {
  renderIcon: (props: { className: string }) => VDom;
};

type PlayerProp = BasePlayerProp &
  (
    | {
        type: "user";
        userId: UserId;
      }
    | {
        type: "bot";
        name: string;
      }
  );
