import { Ease } from '@gamezilla/core';

export type VisualModel = {
  [x: string]: {
    [y: string]: {
      radius: Ease.Model;
    };
  };
};
