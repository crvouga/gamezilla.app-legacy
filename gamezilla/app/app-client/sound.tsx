import { Eff } from "gamezilla/@SHARED/core";
import { SoundCmd } from "gamezilla/app/@SHARED/client";

export type Model = {
  muted: boolean;
};

export const init: Model = {
  muted: false,
};

export type Msg = {
  t: "toggle-mute";
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
  eff?: Eff;
} => {
  switch (cmd.t) {
    case "sound/preload": {
      return {
        model,
        eff: async () => {
          await preloadSounds(cmd.src);
        },
      };
    }
    case "sound/play": {
      if (model.muted) {
        return { model };
      }
      return {
        model,
        eff: async () => {
          await playSound(cmd.src);
        },
      };
    }
  }
};

let audioContext: AudioContext | null = null;

const bufferCache = new Map<string, AudioBuffer>();

let userGestureRequired = true;
const playSound = async (url: string) => {
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
    return;
  }

  const cached = bufferCache.get(url);

  if (cached) {
    const source = audioContext.createBufferSource();
    source.buffer = cached;
    source.connect(audioContext.destination);
    source.start(0);
    return;
  }

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  const source = audioContext.createBufferSource();

  bufferCache.set(url, buffer);

  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
};

const preloadSounds = async (srcList: string[]) => {
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
};
