import { SyncReducer } from "../create.core";
const reducer: SyncReducer = ({ modelSync, msgSync }) => {
    switch (msgSync.t) {
        case "user-changed-list-tab": {
            return {
                ...modelSync,
                listTab: msgSync.listTab,
            };
        }
        default: {
            return modelSync;
        }
    }
};
export const ListTabsGame = {
    reducer,
};
