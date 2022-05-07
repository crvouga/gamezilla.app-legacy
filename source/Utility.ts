export const exhaustive = (
  discriminatedUnionType: "There is a missing case when switching discriminated union"
): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`);
};
