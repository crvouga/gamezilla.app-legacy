import { SpaceViewCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { VDom } from "gamezilla/@CHILD/app/@SHARED/ui";

export type PlayerType = "player-one" | "player-two";

export type VsBotProps = {
  ctx: SpaceViewCtx;
  title: string;
  renderCoverArt: (props: { class: string }) => VDom;
  onQuit: () => void;
  onStartGame: () => void;
  onSwapSides: () => void;
  bot: {
    label: string;
    renderIcon: (props: { class: string }) => VDom;
  };
  playerOne: {
    label: string;
    renderIcon: (props: { class: string }) => VDom;
    onStartPlaying: () => void;
    onStopPlaying: () => void;
  };
  playerTwo: {
    label: string;
    renderIcon: (props: { class: string }) => VDom;
    onStartPlaying: () => void;
    onStopPlaying: () => void;
  };
  botVariants: {
    label: string;
    renderIcon: (props: { class: string }) => VDom;
    onSelect: () => void;
  }[];
};
