export type Crusier = {
	Ship: "Crusier";
	size: 4;
};

const is = (ship: Crusier): ship is Crusier => {
	return ship.Ship === "Crusier";
};

export const Crusier = {
	is,
};
