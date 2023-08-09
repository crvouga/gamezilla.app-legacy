import { Err, Ok, Result, Task } from "gamezilla/core";

export type MicLoadResult = Result<string, null>;

const load: Task<MicLoadResult> = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    return Ok(null);
  } catch (error) {
    return Err("failed_to_load");
  }
};

export type MicUnloadResult = Result<string, null>;

const unload: Task<MicUnloadResult> = async () => {
  return Ok(null);
};

export const Mic = {
  load,
  unload,
};
