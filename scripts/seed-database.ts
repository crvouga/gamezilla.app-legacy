import { faker } from "@faker-js/faker";
import * as ProfileAvatar from "../source/ProfileAvatar";
import { definitions } from "../source/supabase-types";
import { supabaseClient } from "./supabase-client";

const run = async () => {
  for (let i = 0; i < 10; i++) {
    const name = faker.name.findName();
    const email = faker.internet.email();

    const { data: user, error: createUserError } =
      await supabaseClient.auth.api.createUser({
        email,
        password: "password",
      });

    if (createUserError) {
      console.error(createUserError);
      break;
    }
    const username = name.toLowerCase().replace(" ", "");

    const avatar_url = ProfileAvatar.toUrl({
      seed: ProfileAvatar.toSeed(name),
      style: ProfileAvatar.randomStyle(),
    });

    const row: definitions["profile"] = {
      id: user.id,
      name,
      username,
      theme_mode: "SYSTEM",
      avatar_url,
    };

    await supabaseClient.from<definitions["profile"]>("profile").insert([row]);

    console.info("created user ", user.id);
  }
};

run();
