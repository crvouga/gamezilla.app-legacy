export type IO<T> = () => Promise<T>;
const of = <T>(value: T) => async () => {
    return value;
};
const map = <A, B>(mapper: (value: A) => B) => (task: IO<A>): IO<B> => async () => {
    return mapper(await task());
};
const chain = <A, B>(mapper: (a: A) => IO<B>) => (taskA: IO<A>): IO<B> => async () => {
    const a = await taskA();
    const taskB = mapper(a);
    return await taskB();
};
const timeout = <T>(milliseconds: number, value: T): IO<T> => async () => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
    return value;
};
export const IO = {
    map,
    chain,
    timeout,
    of,
};
