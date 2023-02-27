import { UserId } from '@gamezilla/shared';
import { fillBox, text } from '@gamezilla/shared/ui';
import { FrontendModel, FrontendMsg } from './flow.types';

type Model = FrontendModel;

export const init = ({ playerId }: { playerId: UserId }): Model => {
  return {
    playerId,
  };
};

type Msg = FrontendMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model } => {
  switch (msg[0]) {
    case 'none': {
      return { model };
    }
  }
};

export const view = ({ model }: { model: Model }) => {
  return fillBox({}, [text({}, `hello world ${model.playerId}`)]);
};
