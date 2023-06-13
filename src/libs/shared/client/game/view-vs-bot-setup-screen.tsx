import { UserId } from "@gamezilla/shared/app";
import { ViewNode } from "@gamezilla/shared/ui";
import { ViewGameHeader } from "./view-game-header";

type PlayerProp =
  | {
      type: "user";
      userId: UserId;
    }
  | {
      type: "bot";
      name: string;
    };

export const VsBotSetupScreen = ({
  title,
  renderCoverArt,
}: {
  playerOne: PlayerProp;
  playerTwo: PlayerProp;
  title: string;
  renderCoverArt: (props: { className: string }) => ViewNode;
}) => {
  return (
    <div className="w-full">
      <ViewGameHeader renderCoverArt={renderCoverArt} title={title} />

      <div></div>
    </div>
  );
};
