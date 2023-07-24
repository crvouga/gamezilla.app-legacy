import { Result, Task } from "@gamezilla/core";
import * as Rx from "rxjs";
const { Err, Ok } = Result;

const mediaStreams = new Rx.BehaviorSubject<MediaStream | null>(null);

export type MicLoadResult = Result<string, null>;

const load: Task<MicLoadResult> = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    mediaStreams.next(mediaStream);
    return Ok(null);
  } catch (error) {
    return Err("failed_to_load");
  }
};

export type MicUnloadResult = Result<string, null>;

const unload: Task<MicUnloadResult> = async () => {
  const mediaStream = mediaStreams.getValue();

  if (!mediaStream) {
    return Ok(null);
  }

  for (const track of mediaStream.getTracks()) {
    if (track.readyState === "live") {
      track.stop();
    }
  }

  mediaStreams.next(null);

  return Ok(null);
};

export const volumes = new Rx.Subject<number>();

const volumes$ = mediaStreams.pipe(
  Rx.switchMap((mediaStream) => {
    if (!mediaStream) {
      return Rx.NEVER;
    }
    return new Rx.Observable<number>((subscriber) => {
      // source: https://stackoverflow.com/questions/33322681/checking-microphone-volume-in-javascript
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(mediaStream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      scriptProcessor.onaudioprocess = function () {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        const arraySum = array.reduce((a, value) => a + value, 0);
        const average = arraySum / array.length;
        subscriber.next(Math.round(average));
      };

      return () => {
        scriptProcessor.disconnect();
        analyser.disconnect();
        microphone.disconnect();
        audioContext.close();
      };
    });
  }),
  Rx.distinctUntilChanged()
);

volumes$.subscribe((volume) => {
  volumes.next(volume);
});

export const Mic = {
  volumes,
  load,
  unload,
};
