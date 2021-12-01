import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 1,

  tables: [
    tableSchema({
      name: "users",
      columns: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "avatar_url",
          type: "string",
        },
      ],
    }),
  ],
});
