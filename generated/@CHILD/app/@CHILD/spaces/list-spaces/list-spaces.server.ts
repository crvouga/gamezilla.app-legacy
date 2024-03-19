import { sendBack } from "gamezilla-app/@CHILD/app/@SHARED/server";
import * as Space from "../spaces-core/space";
import * as Spaces from "../spaces-core/spaces";
import { ServerModule } from "../spaces.core";
//
//
//
// Update
//
//
//
const update: ServerModule["update"] = async (input) => {
    const { msgClient, model } = input;
    switch (msgClient?.t) {
        case "list-spaces": {
            const spaces = Spaces.listSpaces({
                model,
                limit: msgClient.limit,
                offset: msgClient.offset,
                where: msgClient.where,
            });
            const started = spaces.map(Space.startFromLatestSnapshot);
            return {
                model,
                msgCmd: [
                    sendBack(msgClient, {
                        t: "listed-spaces",
                        spaces: started,
                        causedBy: msgClient.t,
                    }),
                ],
            };
        }
    }
    return { model };
};
//
//
//
//
//
//
export const ListSpacesServer = {
    update,
};
