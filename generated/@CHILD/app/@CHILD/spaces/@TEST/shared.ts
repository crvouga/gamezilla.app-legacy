import { SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data";
import { p } from "gamezilla-app/@SHARED/core";
import { withId } from "../@SHARED/event";
import { Space } from "../spaces-core";
export const makeSpace = (spaceId: SpaceId, hostId: UserId) => {
    return p(Space.init, 
    //
    (model) => Space.appendEvent({
        model,
        event: withId({
            t: "user-started-space",
            spaceId: spaceId,
            userId: hostId,
        }),
    }), (model) => Space.appendEvent({
        model,
        event: withId({
            t: "user-inputted-game",
            spaceId: spaceId,
            userId: hostId,
            game: "connect-four",
        }),
    }));
};
