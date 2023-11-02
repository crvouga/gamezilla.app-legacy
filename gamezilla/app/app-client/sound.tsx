import { Eff, err, ok, Result, UnitInterval } from "gamezilla/@SHARED/core";
import { ClientEvt, SoundCmd } from "gamezilla/app/@SHARED/client";

export type Model = {
  muted: boolean;
  isDocumentVisible: boolean;
};

export const init: Model = {
  muted: false,
  isDocumentVisible: false,
};

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

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
} => {
  switch (msg.t) {
    case "toggle-mute": {
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

export const updateFromEvent = ({
  model,
  evt,
}: {
  model: Model;
  evt: ClientEvt;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  switch (evt.t) {
    case "document-visibility-changed": {
      return {
        model: { ...model, muted: evt.state === "hidden" },
      };
    }
    default: {
      return { model };
    }
  }
};

export const updateFromCmd = ({
  model,
  cmd,
}: {
  model: Model;
  cmd: SoundCmd;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  switch (cmd.t) {
    case "sound/preload": {
      return {
        model,
        eff: async (dispatch) => {
          const preloaded = await preloadSounds(cmd.src);
          dispatch({
            t: "preloaded-sounds",
            src: cmd.src,
            result: preloaded,
          });
        },
      };
    }
    case "sound/play": {
      if (model.muted) {
        return { model };
      }

      return {
        model,
        eff: async (dispatch) => {
          const played = await playSound(
            cmd.src,
            cmd.volume ?? UnitInterval.init(1)
          );
          dispatch({
            t: "played-sound",
            src: cmd.src,
            result: played,
          });
        },
      };
    }
  }
};

const MyAudioContext: typeof window.AudioContext =
  window.AudioContext ||
  // @ts-ignore
  window.webkitAudioContext;

const audioContext = new MyAudioContext();

document.body.addEventListener("click", function () {
  if (audioContext.state === "suspended") {
    audioContext.resume().then(() => {
      console.log("AudioContext resumed successfully");
    });
  }
});

const audioBuffers = new Map<string, AudioBuffer>();

async function preloadSounds(src: string[]) {
  await Promise.allSettled(src.map((s) => preloadSound(s)));
  return ok(null);
}

async function preloadSound(src: string) {
  const response = await fetch(src);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBuffers.set(src, audioBuffer);
  return ok(null);
}

async function playSound(
  src: string,
  volume: number
): Promise<Result<string, null>> {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
  const audioBuffer = audioBuffers.get(src);
  if (!audioBuffer) {
    return err(`Sound not loaded. src: ${src}`);
  }

  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  const gainNode = audioContext.createGain();
  gainNode.gain.value = volume;

  sourceNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  sourceNode.start(0);

  return ok(null);
}
