import * as Rx from "rxjs"

// source: https://stackoverflow.com/questions/33322681/checking-microphone-volume-in-javascript
const volume = (stream: MediaStream): Rx.Observable<number> => {
    const volumes$ = new Rx.Observable<number>((subscriber) => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
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
            subscriber.next(Math.round(average))
        };

        return () => {
            scriptProcessor.disconnect()
            analyser.disconnect()
            microphone.disconnect()
            audioContext.close()
            console.log("CLEAN UP")
        }
    })

    return volumes$.pipe(Rx.distinctUntilChanged())
}

export const Mic = {
    volume
}