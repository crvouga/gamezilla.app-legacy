import { UserId } from "@gamezilla/shared/app";
import { ViewCtx } from "@gamezilla/shared/client";
import { ViewNode } from "@gamezilla/shared/ui";

type IconProps = { className: string };

type PlayerProp = {
  label: string;
  userId: UserId | null;
  onStartPlaying: () => void;
  onStopPlaying: () => void;
  renderIcon: (props: IconProps) => ViewNode;
};

export const VsUserSetupScreen = ({
  playerOne,
  playerTwo,
}: {
  ctx: ViewCtx;
  title: string;
  renderCoverArt: ViewNode;
  playerOne: PlayerProp;
  playerTwo: PlayerProp;
  onStartGame: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center">
        <div>
          {playerOne.renderIcon({
            className: "w-16 h-16",
          })}
        </div>
        <div>
          {playerTwo.renderIcon({
            className: "w-16 h-16",
          })}
        </div>
      </div>
    </div>
  );
};
