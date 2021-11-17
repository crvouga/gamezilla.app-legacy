export const capitalize = (word: string) => {
  const [first, ...rest] = word;
  return `${first.toUpperCase()}${rest.join("").toLowerCase()}`;
};
