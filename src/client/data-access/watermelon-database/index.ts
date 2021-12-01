import { createAction } from "../../../shared";
import { Database } from "@nozbe/watermelondb";
import LokiJSAdapter from "@nozbe/watermelondb/adapters/lokijs";
import migrations from "./model/migrations";
import { schema } from "./model/schema";
import { Dispatch } from "@reduxjs/toolkit";
import User from "./model/user";

const name: "watermelon-database" = "watermelon-database";

const actions = {
  setupError: createAction<Error>(name, "setup-error"),
  quotaExceededError: createAction<Error>(name, "quota-exceeded-error"),
  versionChanged: createAction<Error>(name, "version-changed"),
  didOverwrite: createAction<Error>(name, "did-overwrite"),
};

export const createWatermelonDatabase = ({
  dispatch,
}: {
  dispatch: Dispatch;
}) => {
  const adapterLokiJS = new LokiJSAdapter({
    schema,

    migrations,
    useWebWorker: false,
    useIncrementalIndexedDB: true,

    // --- Optional, but recommended event handlers:
    onQuotaExceededError: (error) => {
      // Browser ran out of disk space -- offer the user to reload the app or log out
      dispatch(actions.quotaExceededError(error));
    },
    onSetUpError: (error) => {
      // Database failed to load -- offer the user to reload the app or log out
      dispatch(actions.setupError(error));
    },
    extraIncrementalIDBOptions: {
      onDidOverwrite: () => {
        // Called when this adapter is forced to overwrite contents of IndexedDB.
        // This happens if there's another open tab of the same app that's making changes.
        // Try to synchronize the app now, and if user is offline, alert them that if they close this
        // tab, some data may be lost
        dispatch(actions.didOverwrite());
      },
      onversionchange: () => {
        // database was deleted in another browser tab (user logged out), so we must make sure we delete
        // it in this tab as well - usually best to just refresh the page
        dispatch(actions.versionChanged());
      },
    },
  });

  const database = new Database({
    adapter: adapterLokiJS,
    modelClasses: [User],
  });

  return database;
};
