import { UserId } from "@gamezilla/shared/app";
import { VDom } from "@gamezilla/ui";
import { SpaceViewCtx } from "../game-shared";

export type PlayerType = "player-one" | "player-two";

export type VsBotProps = {
  ctx: SpaceViewCtx;
  title: string;
  renderCoverArt: (props: { className: string }) => VDom;
  onQuit: () => void;
  canStartGame: boolean;
  onStartGame: () => void;
  human: {
    player: PlayerType;
    userId: UserId | null;
  };
  bot: {
    label: string;
    renderIcon: (props: { className: string }) => VDom;
  };
  playerOne: {
    label: string;
    renderIcon: (props: { className: string }) => VDom;
    onStartPlaying: () => void;
    onStopPlaying: () => void;
  };
  playerTwo: {
    label: string;
    renderIcon: (props: { className: string }) => VDom;
    onStartPlaying: () => void;
    onStopPlaying: () => void;
  };
  botVariants: {
    label: string;
    renderIcon: (props: { className: string }) => VDom;
    onSelect: () => void;
  }[];
};
