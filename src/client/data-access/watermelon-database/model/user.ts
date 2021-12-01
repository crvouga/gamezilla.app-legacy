import { text } from "@nozbe/watermelondb/decorators";
import Model from "@nozbe/watermelondb/Model";

export default class User extends Model {
  static table = "users";

  // @text("avatar_url") avatar_url: string;
  // @text("name") name;
}
