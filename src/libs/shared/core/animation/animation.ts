import { animationFrames, map } from 'rxjs';
import { Sub } from '../sub';

const frames = animationFrames();

export const onFrame = <Msg>(mapper: () => Msg): Sub<Msg> => {
  return frames.pipe(map(mapper));
};
