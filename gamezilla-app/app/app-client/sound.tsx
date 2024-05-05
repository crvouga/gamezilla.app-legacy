import { AppClientModule } from "gamezilla-app/app/@/architecture/app-client";
import {
	APP_SOUND,
	type ClientEvent,
	type SoundCmd,
	playSound,
} from "gamezilla-app/app/@/client";
import {
	IconVolumeHigh,
	IconVolumeXMark,
	ListItemButton,
	ToggleButton,
} from "gamezilla-app/app/@/ui";
import {
	Err,
	Ok,
	type Result,
	TimeSpan,
	UnitInterval,
} from "gamezilla-app/@/core";

//
//
//
//
//
//
//

type Module = AppClientModule<{
	Ctx: null;
	MsgInCmd: SoundCmd;
	MsgInEvent: ClientEvent;
	Model: Model;
	Msg: Msg;
	MsgOutCmd: SoundCmd;
	MsgOutEvent: never;
	MsgToClient: never;
	MsgToServer: never;
}>;

//
//
//
//
// Model
//
//
//
//

export type Model = {
	muted: boolean;
	isDocumentVisible: boolean;
};

export const init: Module["init"] = () => {
	return {
		model: {
			muted: false,
			isDocumentVisible: false,
		},
	};
};

//
//
//
//
// Update
//
//
//
//

export type Msg =
	| {
			t: "toggle-mute";
	  }
	| {
			t: "played-sound";
			src: string;
			result: Result<string, null>;
	  }
	| {
			t: "preloaded-sounds";
			src: string[];
			result: Result<string, null>;
	  };

export const update: Module["update"] = (input) => {
	return AppClientModule.andThen(
		{ model: input.model },
		(model) => updateFromMsg({ ...input, model }),
		(model) => updateFromCmd({ ...input, model }),
		(model) => updateFromEvent({ ...input, model }),
	);
};

const updateFromMsg: Module["update"] = ({ msg, model }) => {
	if (!msg) {
		return { model };
	}

	switch (msg.t) {
		case "toggle-mute": {
			if (model.muted) {
				return {
					model: {
						...model,
						muted: false,
					},
					msgCmd: [playSound(APP_SOUND.stateChangeUp)],
				};
			}
			return {
				model: {
					...model,
					muted: !model.muted,
				},
			};
		}
		case "played-sound": {
			return {
				model,
			};
		}
		case "preloaded-sounds": {
			return {
				model,
			};
		}
	}
};

const updateFromEvent: Module["update"] = ({ model, msgEvt }) => {
	if (!msgEvt) {
		return { model };
	}

	switch (msgEvt.t) {
		case "platform/document-visibility-changed": {
			return {
				model: { ...model, muted: msgEvt.state === "hidden" },
			};
		}

		default: {
			return { model };
		}
	}
};

export const updateFromCmd: Module["update"] = ({ model, msgCmd }) => {
	if (!msgCmd) {
		return { model };
	}

	const soundCmd = msgCmd.c;

	switch (soundCmd.t) {
		case "preload": {
			return {
				model,
				eff: async (dispatch) => {
					const preloaded = await preloadSounds(soundCmd.src);
					dispatch({
						t: "preloaded-sounds",
						src: soundCmd.src,
						result: preloaded,
					});
				},
			};
		}
		case "play": {
			if (model.muted) {
				return { model };
			}

			return {
				model,
				eff: async (dispatch) => {
					const { delay } = soundCmd;

					if (delay) {
						await new Promise((r) =>
							setTimeout(r, TimeSpan.toMilliseconds(delay)),
						);
					}

					const played = await playSoundEff(
						soundCmd.src,
						soundCmd.volume ?? UnitInterval.init(1),
					);
					dispatch({
						t: "played-sound",
						src: soundCmd.src,
						result: played,
					});
				},
			};
		}
	}
};

export const ViewStatusBar = (props: { model: Model }) => {
	if (props.model.muted) {
		return <IconVolumeXMark className="h-4 w-4" />;
	}

	return <IconVolumeHigh className="h-4 w-4" />;
};

export const ViewStatusBarDrawer = ({
	model,
	dispatch,
}: {
	model: Model;
	dispatch: (m: Msg) => void;
}) => {
	return (
		<ListItemButton
			onClick={() => dispatch({ t: "toggle-mute" })}
			icon={(props) =>
				model.muted ? (
					<IconVolumeXMark {...props} />
				) : (
					<IconVolumeHigh {...props} />
				)
			}
			label={model.muted ? "Sound off" : "Sound on"}
			end={() => (
				<ToggleButton
					label="toggle sound"
					checked={!model.muted}
					id="toggle-sound"
				/>
			)}
		/>
	);
};

//
//
//
//
//
// Web Audio
//
//
//
//
//

const MyAudioContext = (): typeof window.AudioContext => {
	return (
		window.AudioContext ||
		// @ts-ignore
		window.webkitAudioContext
	);
};

let _audioContext: AudioContext;

const getAudioContext = () => {
	if (!_audioContext) {
		_audioContext = new (MyAudioContext())();
	}
	return _audioContext;
};

let hasResumed = false;
export const resumedPromise = async () => {
	if (hasResumed) {
		return;
	}
	await new Promise((resolve) => {
		const handler = async (): Promise<null> => {
			const audioContext = getAudioContext();

			switch (audioContext.state) {
				case "closed":
				case "running": {
					resolve(null);
					document.body.removeEventListener("click", handler);
					document.body.removeEventListener("touchstart", handler);
					return null;
				}

				case "suspended": {
					await audioContext.resume();
					resolve(null);
					document.body.removeEventListener("click", handler);
					document.body.removeEventListener("touchstart", handler);
					return null;
				}
			}
		};

		document.body.addEventListener("click", handler);
		document.body.addEventListener("touchstart", handler);
	});
	hasResumed = true;
};
const audioBuffers = new Map<string, AudioBuffer>();

async function preloadSounds(src: string[]) {
	await Promise.allSettled(src.map((s) => preloadSound(s)));
	return Ok(null);
}

async function preloadSound(src: string) {
	const response = await fetch(src);
	const arrayBuffer = await response.arrayBuffer();
	const audioContext = getAudioContext();
	const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
	audioBuffers.set(src, audioBuffer);
	return Ok(null);
}

async function playSoundEff(
	src: string,
	volume: number,
): Promise<Result<string, null>> {
	const audioBuffer = audioBuffers.get(src);

	if (!audioBuffer) {
		return Err(`Sound not loaded. src: ${src}`);
	}
	const audioContext = getAudioContext();
	const sourceNode = audioContext.createBufferSource();
	sourceNode.buffer = audioBuffer;
	const gainNode = audioContext.createGain();
	gainNode.gain.value = volume;

	sourceNode.connect(gainNode);
	gainNode.connect(audioContext.destination);

	sourceNode.start(0);

	return Ok(null);
}
