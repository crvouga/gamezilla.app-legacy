import { Err, Ok, type Result } from '~/@/result'
import { IO } from '~/@/program/io'

export type MicLoadResult = Result<string, null>

const load: IO<MicLoadResult> = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    return Ok(null)
  } catch (error) {
    return Err('failed_to_load')
  }
}

export type MicUnloadResult = Result<string, null>

const unload: IO<MicUnloadResult> = async () => {
  return Ok(null)
}

export const Mic = {
  load,
  unload
}
