export type IOk<TData> = {
  type: "Success";
  data: TData;
};

const Ok = <TData>(data: TData): IOk<TData> => {
  return {
    type: "Success",
    data,
  };
};

export type IErr = {
  type: "Err";
  messages: string[];
};

const Err = (...messages: string[]): IErr => {
  return {
    type: "Err",
    messages,
  };
};

export type IResult<TData> = IOk<TData> | IErr;

export const Result = {
  Ok,
  Err,
};
