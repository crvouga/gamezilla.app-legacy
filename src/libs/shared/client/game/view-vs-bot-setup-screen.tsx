import { UserId } from "@gamezilla/shared/app";
import { VDom } from "@gamezilla/shared/ui";
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
  botName: string;
  userId: UserId | null;

  playerTwo: PlayerProp;
  title: string;
  renderCoverArt: (props: { className: string }) => VDom;
}) => {
  return (
    <div className="w-full">
      <ViewGameHeader renderCoverArt={renderCoverArt} title={title} />

      <div></div>
    </div>
  );
};
