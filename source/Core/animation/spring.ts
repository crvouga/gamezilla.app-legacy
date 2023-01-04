import { Sub } from "../Sub";

export type Model = {
    current: number;
    target: number;
    velocity: number;
    friction: number;
    tension: number;
    precision: number;
};

export const isDone = (model: Model): boolean => {
    return (
        Math.abs(model.velocity) < model.precision && Math.abs(model.target - model.current) < model.precision
    )
}

export const step = (model: Model): Model => {
    if (isDone(model)) {
        return model
    }
    const velocityNew = model.velocity + (model.target - model.current) * model.tension;
    const currentNew = model.current + velocityNew;
    const velocityNew2 = velocityNew * (1 - model.friction);
    const modelNew: Model = {
        ...model,
        current: currentNew,
        velocity: velocityNew2,
    }
    return modelNew
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

