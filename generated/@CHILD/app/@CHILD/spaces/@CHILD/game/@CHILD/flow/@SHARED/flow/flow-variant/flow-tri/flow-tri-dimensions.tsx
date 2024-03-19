export type Model = {
    t: "flow-tri";
    side: number;
};
export const init = (input: {
    side: number;
}): Model => {
    return {
        t: "flow-tri",
        side: input.side,
    };
};
export const ViewForm = (_input: {
    form: Model;
    onInput: (dimensions: Model) => void;
}) => {
    return <>flow tri dimensions form</>;
};
