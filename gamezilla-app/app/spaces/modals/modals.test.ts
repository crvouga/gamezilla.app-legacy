import { describe, expect, it } from "bun:test";
import { AppClientModule } from "gamezilla-app/app/@/architecture/app-client.tsx";
import { didOpenProfile } from "gamezilla-app/app/@/client/client-cmd.ts";
import { UserId } from "../../@/data/user-id.ts";
import { openUserDetails } from "../@/space-client-cmd.ts";
import {
	changeRoute,
	clickedPeopleButton,
	clickedUser,
	clickedUserPreviewLink,
	Ctx,
	init,
} from "../@/testing/client.ts";
import { SpaceClientModule } from "../architecture/architecture.tsx";
import { Modals } from "./modals.tsx";

describe(import.meta.file, () => {
	it("should start with no modals open", async () => {
		const ctx = Ctx();
		const output = await AppClientModule.andThen(init(ctx));
		expect(output.model.modal === null).toBe(true);
	});

	it("should open users modal when user clicks on users button", async () => {
		const ctx = Ctx();
		const output = await AppClientModule.andThen(
			init(ctx),
			clickedPeopleButton(ctx),
			//
		);
		expect(output.model.modal === "users").toBe(true);
	});

	it("should open user details modal after clicking user", async () => {
		const ctx = Ctx();

		const someUserId = UserId.generate();

		const output = await AppClientModule.andThen(
			init(ctx),
			clickedUser(ctx, someUserId),
		);
		expect(
			output.model.modal === "user-preview" &&
				output.model.modalPreviewUserId === someUserId,
		).toBe(true);
	});

	it("should close modal when the current route changes", async () => {
		const someUserId = UserId.generate();
		const ctx = Ctx();
		const output = await AppClientModule.andThen(
			init(ctx),
			clickedUser(ctx, someUserId),
			changeRoute(ctx, { n: "spaces", t: "space-list" }),
		);
		expect(output.model.modal === null).toBe(true);
	});

	it("should open user details corresponding cmd", async () => {
		const ctx = Ctx();
		const someUserId = UserId.generate();

		const output = await SpaceClientModule.andThen(init(ctx), (model) =>
			Modals.update({
				model,
				ctx,
				msgCmd: openUserDetails(someUserId),
			}),
		);
		expect(
			output.model.modal === "user-preview" &&
				output.model.modalPreviewUserId === someUserId,
		).toBe(true);
	});

	it("should navigate to preview users profile page when clicked", async () => {
		const ctx = Ctx();
		const someUserId = UserId.generate();
		const output = await SpaceClientModule.andThen(
			init(ctx),
			clickedUser(ctx, someUserId),
			clickedUserPreviewLink(ctx),
		);

		expect(didOpenProfile(output, someUserId)).toBe(true);
	});

	it("should play sound when clicking preview user link", async () => {
		const ctx = Ctx();
		const someUserId = UserId.generate();
		const output = await SpaceClientModule.andThen(
			init(ctx),
			clickedUser(ctx, someUserId),
			clickedUserPreviewLink(ctx),
		);

		expect(
			output.msgCmd?.some(
				(msgCmd) => msgCmd.t === "sound" && msgCmd.c.t === "play",
			),
		).toBe(true);
	});

	it("should not navigate after clicking preview user link if preview is not open", async () => {
		const ctx = Ctx();
		const someUserId = UserId.generate();
		const output = await SpaceClientModule.andThen(
			init(ctx),
			clickedUserPreviewLink(ctx),
		);

		expect(
			output.msgCmd?.some(
				(msgCmd) =>
					msgCmd.t === "profile" &&
					msgCmd.c.t === "open-profile" &&
					msgCmd.c.userId === someUserId,
			),
		).toBe(false);
	});
});
