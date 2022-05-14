export const exhaustive = (
  discriminatedUnionType: "There is a missing case when switching on discriminated union"
): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`);
};
