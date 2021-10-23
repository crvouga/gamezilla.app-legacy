export const cleanPhoneNumber = (input: string) => {
  return input.replace(/\D/g, "").substring(0, 10);
};

export const formatPhoneNumber = (dirtyInput: string) => {
  let input = cleanPhoneNumber(dirtyInput);

  if (input.length > 0) {
    input = "(" + input;
  }

  if (input.length > 3) {
    input = input.slice(0, 4) + ") " + input.slice(4);
  }

  if (input.length > 6) {
    input = input.slice(0, 9) + " " + input.slice(9);
  }

  return input;
};
