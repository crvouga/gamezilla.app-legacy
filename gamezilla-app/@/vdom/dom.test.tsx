import { expect, test } from "bun:test";
import { RenderToString } from "./render";

test("dom test", () => {
	document.body.innerHTML = "<button>My button</button>";
	const button = document.querySelector("button");
	expect(button?.innerText).toEqual("My button");
});

test.todo("vdom render test", async () => {
	const renderToString = await RenderToString("solid");
	const string = renderToString(<button type="button">My button</button>);
	expect(string).toEqual("<button>My button</button>");
	const button = document.querySelector("button");
	expect(button?.innerText).toEqual("My button");
});
