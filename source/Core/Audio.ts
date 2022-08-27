import { pipe } from "./pipe"
import * as Result from "./Result"
import * as Task from "./Task"
import * as Cmd from "./Cmd"
import { Unit } from "./Utility"

export type Problem = "Unknown"

export type PlayResult = Result.Result<Problem, Unit>

export const play = <msg>(src: string, mapper: (result: PlayResult) => msg) =>
  pipe(
    playTask(src),
    Cmd.perform((result) => mapper(result)),
  )

// using hacks for ios:  https://web.archive.org/web/20170215083556/http://www.ibm.com/developerworks/library/wa-ioshtml5/

let _audio: HTMLAudioElement

const playTask =
  (src: string): Task.Task<PlayResult> =>
  async () => {
    try {
      if (!_audio) {
        _audio = new Audio()
      }
      _audio.src = src
      _audio.autoplay = true
      await _audio.play()
      return Result.Ok(Unit)
    } catch (error) {
      return Result.Err("Unknown")
    }
  }
