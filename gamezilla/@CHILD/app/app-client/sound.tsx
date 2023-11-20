import { ClientEvt, SoundCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { Eff, err, ok, Result, UnitInterval } from "gamezilla/@SHARED/core";

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

export const init = ({
  stored,
}: {
  stored: Model | null;
}): {
  model: Model;
} => {
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
    case "platform/document-visibility-changed": {
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

async function playSound(
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
