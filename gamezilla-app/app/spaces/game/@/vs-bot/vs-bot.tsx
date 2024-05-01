import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import type { VDom } from "gamezilla-app/@/vdom";

export type PlayerType = "player-one" | "player-two";

export type VsBotProps = {
	ctx: SpaceClientCtx;
	title: string;
	renderCoverArt: (props: { className: string }) => VDom;
	onQuit: () => void;
	onStartGame: () => void;
	onSwapSides: () => void;
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
