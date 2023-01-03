import { Sub } from "../Sub";

export type Model = {
    current: number;
    target: number;
    velocity: number;
    friction: number;
    tension: number;
    mass: number;
};

export const isDone = (model: Model): boolean => {
    return (
        Math.abs(model.velocity) < 0.001 && Math.abs(model.target - model.current) < 0.001
    )
}

export const step = (model: Model): [Model, boolean] => {
    const velocityNew = model.velocity + (model.target - model.current) * model.tension;
    const currentNew = model.current + velocityNew;
    const velocityNew2 = velocityNew * (1 - model.friction);

    const modelNew = {
        current: currentNew,
        target: model.target,
        velocity: velocityNew2,
        friction: model.friction,
        tension: model.tension,
        mass: model.mass,
    }

    return [modelNew, true]
}


export const onAnimationFrame = <Msg>(mapper: () => Msg): Sub<Msg> => {
    return Sub.create<Msg>((emit) => {
        const id = requestAnimationFrame(() => {
            emit(mapper())
        })

        return () => {
            cancelAnimationFrame(id)
        }
    })

}

