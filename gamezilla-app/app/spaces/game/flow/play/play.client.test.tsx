import { describe, expect, it } from "bun:test";

const Fixture = async () => {
	return {};
};

describe(import.meta.file, () => {
	it("should render exit button", async () => {
		const f = await Fixture();
		f;
		// const rendered = f.render(f.init)
		// expectButtonByText(rendered, f.ctx.t("exit"))
		expect(true).toBe(false);
	});
});
