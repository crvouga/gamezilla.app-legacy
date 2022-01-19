export type IMaybe<T> =
  | {
      type: "Nothing";
    }
  | {
      type: "Just";
      value: T;
    };

const Just = <T>(value: T): IMaybe<T> => {
  return {
    type: "Just",
    value,
  };
};

export const Nothing = {
  type: "Nothing" as "Nothing",
};

export default {
  Just,
  Nothing,
};
