import { Eff } from "gamezilla/@SHARED/core";
import { SoundCmd } from "gamezilla/app/@SHARED/client";

export type Model = {
  muted: boolean;
};

export const init: Model = {
  muted: false,
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

const playSound = async (url: string) => {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
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
