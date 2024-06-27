import { Program } from "gamezilla-app/@/core";
import { DebuggerReduxDevTools } from "gamezilla-app/@/core/debug";
import * as AppClient from "gamezilla-app/app/app.client";
import {
	CODEBASE_VERSION_ID,
	IS_PROD,
	SERVER_IMPL,
	SERVER_URL,
	TRANSPORT_IMPL,
	VDOM_IMPL,
} from "public-config";
import { Render } from "./@/vdom";

const main = async () => {
	const deps = await AppClient.getDeps({
		codebaseVersionId: CODEBASE_VERSION_ID,
		serverImpl: SERVER_IMPL,
		serverUrl: SERVER_URL,
	});

	const root = document.getElementById("root");

	if (!root) {
		throw new Error("Root element not found");
	}

	const render = await Render(VDOM_IMPL, root);

	await Program.run({
		ctx: AppClient.ctx,

		init: (input) => AppClient.init({ ...input, deps }),

		update: (input) => AppClient.update({ ...input, deps }),

		subscriptions: (input) => AppClient.subscriptions({ ...input, deps }),

		render: (input) => render(<AppClient.View {...input} />),

		crash: (input) => console.error("Crash!", input.error),

		debugger: DebuggerReduxDevTools,
	});

	await deps.transport.start();

	console.log({ IS_PROD, TRANSPORT_IMPL, VDOM_IMPL });
};

main();
