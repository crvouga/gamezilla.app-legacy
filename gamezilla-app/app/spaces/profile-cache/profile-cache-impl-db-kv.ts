import { Ok } from "gamezilla-app/@/core";
import { Profile, type UserId } from "gamezilla-app/app/@/data";
import { IDbConnKv } from "gamezilla-app/app/@/server/db-conn-kv";
import type { IProfileCache } from "./profile-cache";

export const ProfileCacheDbKv = ({
	dbConnKv,
}: {
	dbConnKv: IDbConnKv;
}): IProfileCache => {
	const profilesKv = IDbConnKv.instance(
		dbConnKv,
		["spaces", "profile-cache"],
		Profile,
	);
	return {
		async add(profiles) {
			await Promise.all(
				Object.entries(profiles).map(([userId, profile]) =>
					profilesKv.set(userId, profile),
				),
			);
			return Ok(null);
		},
		async get(userIds) {
			const profiles: { [userId: UserId]: Profile } = {};

			const all = await Promise.all(
				userIds.map((userId) => profilesKv.get(userId)),
			);

			for (const result of all) {
				if (result.t === "ok") {
					const profile = result.value;
					if (profile) {
						profiles[profile.userId] = profile;
					}
				}
			}

			return Ok(profiles);
		},
	};
};
