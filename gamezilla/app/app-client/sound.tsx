import { Eff, Err, Ok, Result } from "gamezilla/@SHARED/core";
import { ClientEvt, SoundCmd } from "gamezilla/app/@SHARED/client";
// https://github.com/goldfire/howler.js#quick-start
import { Howl, Howler } from "howler";

// docs: https://github.com/goldfire/howler.js#documentation
Howler.volume(1);
Howler.autoUnlock = true;
Howler.usingWebAudio = true;
Howler.autoSuspend = false;
Howler.html5PoolSize = 100;

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

const howls = new Map<string, Howl>();
const loadHowl = (src: string) => {
  const cached = howls.get(src);
  if (cached) {
    return cached;
  }
  const howl = new Howl({
    src,
    preload: true,
    html5: false,
    autoplay: false,
    loop: false,
    mute: false,
    format: ["wav"],
    volume: 1,
  });
  howl.once("loaderror", () => {
    Howler.unload();
  });
  howl.once("playerror", () => {
    Howler.unload();
  });
  howls.set(src, howl);
  return howl;
};

const playSound = async (src: string) => {
  try {
    const howl = loadHowl(src);

    howl.play();

    return Ok(null);
  } catch (error) {
    return Err({ error, message: "Caught error" });
  }
};

const preloadSounds = async (srcList: string[]) => {
  try {
    for (const src of srcList) {
      loadHowl(src);
    }
    return Ok(null);
  } catch (error) {
    return Err({ error, message: "Caught error" });
  }
};
