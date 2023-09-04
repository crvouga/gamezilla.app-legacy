import { Eff, Err, Ok, Result } from "gamezilla/@SHARED/core";
import { ClientEvt, SoundCmd } from "gamezilla/app/@SHARED/client";
import "./sound-audio-context-monkey-patch";

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
      result: Result<unknown, null>;
    }
  | {
      t: "preloaded-sounds";
      src: string[];
      result: Result<unknown, null>;
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

export const updateFromEvt = ({
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
          const played = await playSound(cmd.src);
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

let audioContext: AudioContext | null = null;

const bufferCache = new Map<string, AudioBuffer>();

let userGestureRequired = false;
const playSound = async (url: string) => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Try resuming context to handle user gesture requirement
      if (audioContext.state === "suspended") {
        await audioContext.resume();
        userGestureRequired = false;
      }
    }

    if (userGestureRequired) {
      return Err({ message: "User gesture required" });
    }

    const cached = bufferCache.get(url);

    if (cached) {
      const source = audioContext.createBufferSource();
      source.buffer = cached;
      source.connect(audioContext.destination);
      source.start(0);
      return Ok(null);
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    const source = audioContext.createBufferSource();

    bufferCache.set(url, buffer);

    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    return Ok(null);
  } catch (error) {
    return Err({ error, message: "Caught error" });
  }
};

const preloadSounds = async (srcList: string[]) => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    for (const src of srcList) {
      const cached = bufferCache.get(src);
      if (cached) {
        continue;
      }
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);

      bufferCache.set(src, buffer);
    }
    return Ok(null);
  } catch (error) {
    return Err({ error, message: "Caught error" });
  }
};
