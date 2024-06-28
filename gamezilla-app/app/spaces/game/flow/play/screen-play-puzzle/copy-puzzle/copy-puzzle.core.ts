import { CoreModule } from "../../play.types";


export const updateCore: CoreModule["updateCore"] = (input) => {
    return input.modelCore;
}