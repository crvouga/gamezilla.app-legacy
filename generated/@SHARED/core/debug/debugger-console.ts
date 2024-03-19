import { ProgramDebugger } from "../program";
export const DebuggerConsole: ProgramDebugger = (initialModel, setModel) => {
    console.log("DebuggerConsole: initialModel", initialModel);
    // @ts-ignore
    window.setModel = setModel;
    return async (model, msg) => {
        console.log("DebuggerConsole: model", model);
        console.log("Debugger Console: msg ", msg);
    };
};
