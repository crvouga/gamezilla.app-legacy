export type Model = {
	current: number;
	target: number;
	velocity: number;
	friction: number;
	tension: number;
	precision: number;
};

export type Config = {
	velocity: number;
	friction: number;
	tension: number;
	precision: number;
	mass: number;
};

export const init = (inp: {from: number; to: number}): Model => {
	return {
		current: inp.from,
		target: inp.to,
		velocity: 0,
		friction: 0.9,
		tension: 0.25,
		precision: 0.01,
	};
};

export const isDone = (model: Model): boolean => {
	return (
		Math.abs(model.velocity) < model.precision &&
		Math.abs(model.target - model.current) <
			model.precision
	);
};

export const step = (model: Model): Model => {
	if (isDone(model)) {
		return model;
	}
	const velocityNew =
		model.velocity +
		(model.target - model.current) * model.tension;
	const currentNew = model.current + velocityNew;
	const velocityNew2 = velocityNew * (1 - model.friction);
	const modelNew: Model = {
		...model,
		current: currentNew,
		velocity: velocityNew2,
	};
	return modelNew;
};
