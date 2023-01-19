import { Cmd } from '../cmd';
import { p } from '../pipe';
import { Result } from '../result';
import { Unit } from '../utils';

export type Problem = 'Unknown';

export type PlayResult = Result<Problem, Unit>;

export type PreloadResult = Result<Problem, Unit>;

export const preload = <msg>(
  srcList: string[],
  mapper: (result: PreloadResult) => msg
) =>
  p(async () => {
    // for (const src of srcList) {
    // getSoundInstance(src)
    // }
    return Result.Ok(Unit);
  }, Cmd.perform(mapper));

export const play = <msg>(src: string, mapper: (result: PlayResult) => msg) =>
  p(async () => {
    // const sound = getSoundInstance(src);

    if (document.hasFocus()) {
      // sound.play();
    }

    return Result.Ok(Unit);
  }, Cmd.perform(mapper));
