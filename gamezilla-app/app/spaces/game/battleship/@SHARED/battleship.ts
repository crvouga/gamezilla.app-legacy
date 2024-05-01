import { Polymorphic } from "gamezilla-app/@shared/polymorphism/polymorphic-function";

type Torpedo = {
	type: "Torpedo";
};

type Cannonball = {
	type: "Cannonball";
};

type Ammo = Torpedo | Cannonball;

type Battleship = {
	type: "Battleship";
};

type Submarine = {
	type: "Submarine";
};

type Ship = Battleship | Submarine;

const isTorpedo = (ammo: Ammo): ammo is Torpedo => {
	return ammo.type === "Torpedo";
};

const isCannonball = (ammo: Ammo): ammo is Cannonball => {
	return ammo.type === "Cannonball";
};

const isBattleship = (ship: Ship): ship is Battleship => {
	return ship.type === "Battleship";
};

const isSubmarine = (ship: Ship): ship is Submarine => {
	return ship.type === "Submarine";
};

type Model = {
	playerOne: {
		ships: Ship[];
	};
	playerTwo: {
		ships: Ship[];
	};
	message: string;
};

//
//
//
//
//
//
//

type ShootInput = { ammo: Ammo; target: Ship; shotCount: number };

const shoot = Polymorphic<(input: ShootInput, model: Model) => Model>();

shoot.implementDefault((_input, model) => {
	return model;
});

shoot.implement(
	(input): input is ShootInput & { ammo: Cannonball; target: Battleship } =>
		isCannonball(input.ammo) && isBattleship(input.target),
	(_input, model) => {
		return {
			...model,
			message: "Cannonball hits the battleship with significant damage.",
		};
	},
);

shoot.implement(
	(input): input is ShootInput & { ammo: Cannonball; target: Submarine } =>
		isCannonball(input.ammo) && isSubmarine(input.target),
	(_input, model) => {
		return {
			...model,
			message: "Cannonball splashes harmlessly into the water.",
		};
	},
);

shoot.implement(
	(input): input is ShootInput & { ammo: Torpedo; target: Submarine } =>
		isTorpedo(input.ammo) && isSubmarine(input.target),
	(_input, model) => {
		return {
			...model,
			message: "Torpedo strikes the submarine with devastating force.",
		};
	},
);

shoot.implement(
	(input): input is ShootInput & { ammo: Torpedo; target: Battleship } =>
		isTorpedo(input.ammo) && isBattleship(input.target),
	(_input, model) => {
		return {
			...model,
			message: "Torpedo damages the battleship's hull.",
		};
	},
);

//
//
//
//
// Example usage
//
//
//
//

const cannonball: Cannonball = { type: "Cannonball" };
const torpedo: Torpedo = { type: "Torpedo" };
const battleship: Battleship = { type: "Battleship" };
const submarine: Submarine = { type: "Submarine" };
const model: Model = {
	message: "",
	playerOne: {
		ships: [battleship],
	},
	playerTwo: {
		ships: [submarine],
	},
};
console.log(
	shoot(
		{
			ammo: cannonball,
			target: battleship,
			shotCount: 1,
		},
		model,
	),
);
console.log(
	shoot(
		{
			ammo: cannonball,
			target: submarine,
			shotCount: 1,
		},
		model,
	),
);
console.log(
	shoot(
		{
			ammo: torpedo,
			target: submarine,
			shotCount: 1,
		},
		model,
	),
);
console.log(
	shoot(
		{
			ammo: torpedo,
			target: battleship,
			shotCount: 1,
		},
		model,
	),
);
