export const split = (separator: string, x: string) => {
  return x.split(separator);
};

export const join = (separator: string, xs: string[]) => {
  return xs.join(separator);
};

export const capitalize = (word: string) => {
  const [firstLetter, ...rest] = word;
  return `${firstLetter.toUpperCase()}${rest.join("").toLowerCase()}`;
};
