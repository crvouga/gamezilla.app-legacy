import { Observable } from 'rxjs';
import { Sub } from '../sub';

const frames$ = new Observable((subscriber) => {
  const id = requestAnimationFrame(() => {
    subscriber.next();
  });
  return () => {
    cancelAnimationFrame(id);
  };
});

export const onFrame = <Msg>(mapper: () => Msg): Sub<Msg> => {
  return Sub.map(mapper)(frames$);
};
