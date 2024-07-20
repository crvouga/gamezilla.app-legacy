import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import type { VDom } from "gamezilla-app/@/vdom";
import { TranslatedText } from "gamezilla-app/@/l18n";

export type PlayerType = "player-one" | "player-two";

export type VsBotInput = {
	ctx: SpaceClientCtx;
	title: TranslatedText;
	renderCoverArt: (input: { className: string }) => VDom;
	onQuit: () => void;
	onStartGame: () => void;
	onSwapSides: () => void;
	bot: {
		label: string;
		renderIcon: (input: { className: string }) => VDom;
	};
	playerOne: {
		label: string;
		renderIcon: (input: { className: string }) => VDom;
		onStartPlaying: () => void;
		onStopPlaying: () => void;
	};
	playerTwo: {
		label: string;
		renderIcon: (input: { className: string }) => VDom;
		onStartPlaying: () => void;
		onStopPlaying: () => void;
	};
	botVariants: {
		label: string;
		renderIcon: (input: { className: string }) => VDom;
		onSelect: () => void;
	}[];
};
