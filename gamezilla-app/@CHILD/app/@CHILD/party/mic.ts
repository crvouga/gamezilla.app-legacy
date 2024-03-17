import { err, ok, Result, IO } from "gamezilla-app/@SHARED/core"

export type MicLoadResult = Result<string, null>

const load: IO<MicLoadResult> = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    return ok(null)
  } catch (error) {
    return err("failed_to_load")
  }
}

export type MicUnloadResult = Result<string, null>

const unload: IO<MicUnloadResult> = async () => {
  return ok(null)
}

export const Mic = {
  load,
  unload,
}
