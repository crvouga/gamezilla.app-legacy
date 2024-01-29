import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import {
  APP_SOUND,
  ClientEvent,
  SoundCmd,
  playSound,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconVolumeHigh,
  IconVolumeXMark,
  ToggleButton,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import {
  Result,
  TimeSpan,
  UnitInterval,
  err,
  ok,
} from "gamezilla/@SHARED/core";

//
//
//
//
//
//
//

type Module = AppClientModule<{
  Ctx: null;
  InCmd: SoundCmd;
  InEvent: ClientEvent;
  Model: Model;
  Msg: Msg;
  OutCmd: SoundCmd;
  OutEvent: never;
  ToClient: never;
  ToServer: never;
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

export const init: Module["init"] = ({ stored }) => {
  if (stored) {
    return {
      model: stored,
    };
  }

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
  return AppClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateFromEvent({ ...input, model })
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
          cmd: [playSound(APP_SOUND.tap)],
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

const updateFromEvent: Module["update"] = ({ model, msgEvent }) => {
  if (!msgEvent) {
    return { model };
  }

  switch (msgEvent.t) {
    case "platform/document-visibility-changed": {
      return {
        model: { ...model, muted: msgEvent.state === "hidden" },
      };
    }

    default: {
      return { model };
    }
  }
};

export const updateFromCmd: Module["update"] = async ({ model, cmd }) => {
  if (!cmd) {
    return { model };
  }

  const soundCmd = cmd.c;

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
              setTimeout(r, TimeSpan.toMilliseconds(delay))
            );
          }

          const played = await playSoundEff(
            soundCmd.src,
            soundCmd.volume ?? UnitInterval.init(1)
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

export const ViewStatusBar = ({ model }: { model: Model }) => {
  if (model.muted) {
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
    <div className="flex w-full items-center">
      <button
        className="flex w-full flex-1 items-center gap-4 p-4"
        tabIndex={-1}
        onClick={() => dispatch({ t: "toggle-mute" })}
      >
        {model.muted ? (
          <>
            <IconVolumeXMark className="h-5 w-5" />
            <p>Sound off</p>
          </>
        ) : (
          <>
            <IconVolumeHigh className="h-5 w-5" />
            <p>Sound on</p>
          </>
        )}
      </button>
      <div className="flex items-center justify-center p-4">
        <ToggleButton
          label="toggle sound"
          onToggle={() => dispatch({ t: "toggle-mute" })}
          checked={!model.muted}
          id="sound"
        />
      </div>
    </div>
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

const MyAudioContext: typeof window.AudioContext =
  window.AudioContext ||
  // @ts-ignore
  window.webkitAudioContext;

let _audioContext: AudioContext;

const getAudioContext = () => {
  if (!_audioContext) {
    _audioContext = new MyAudioContext();
  }
  return _audioContext;
};

const resumedPromise = new Promise((resolve) => {
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

const audioBuffers = new Map<string, AudioBuffer>();

async function preloadSounds(src: string[]) {
  await Promise.allSettled(src.map((s) => preloadSound(s)));
  return ok(null);
}

async function preloadSound(src: string) {
  await resumedPromise;

  const response = await fetch(src);
  const arrayBuffer = await response.arrayBuffer();
  const audioContext = getAudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBuffers.set(src, audioBuffer);
  return ok(null);
}

async function playSoundEff(
  src: string,
  volume: number
): Promise<Result<string, null>> {
  await resumedPromise;

  const audioBuffer = audioBuffers.get(src);

  if (!audioBuffer) {
    return err(`Sound not loaded. src: ${src}`);
  }
  const audioContext = getAudioContext();
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  const gainNode = audioContext.createGain();
  gainNode.gain.value = volume;

  sourceNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  sourceNode.start(0);

  return ok(null);
}
