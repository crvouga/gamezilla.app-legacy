type IRoute<TType extends string> = {
  type: TType;
  child?: IRoute<TType>;
};

export const encode = (route: IRoute<string>): string => {
  if (route.child) {
    return `/${route.type}${encode(route.child)}`;
  }

  return `/${route.type}`;
};

export const decode = <TType extends string>(url: string): IRoute<TType> => {
  const [first, ...rest] = url.split("/");

  const type = first as TType;

  if (rest.length > 0) {
    return {
      type,
      child: decode(rest.join("/")),
    };
  }

  return {
    type,
  };
};
