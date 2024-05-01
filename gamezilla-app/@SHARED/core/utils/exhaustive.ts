export const exhaustive = (discriminatedUnionType: "Missing Case!"): never => {
	throw new Error(`Missing case for: ${discriminatedUnionType}`);
};
